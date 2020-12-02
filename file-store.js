// Importing necessary modules.shelljs used for effiecient creating of directories
const fs = require("fs");
const path = require("path");
const shelljs = require("shelljs");


//FileStore system contains store as json file and store-registry to track usage 
class FileStore {
	// Construcor creates or use default store if path not provied else it will create or use store in provided path
	constructor(dirpath) {

		//function that  creates store and store-registry
		const createStore = function (store, storeregistry) {
			fs.writeFileSync(store, "");
			fs.writeFileSync(storeregistry, JSON.stringify({ useFlag: "true" }), (err) => {
				if (err) {
					throw err;
				}
			});
		}
		//function that register store to an object if already in use it throws error
		const registerStore = function (storeregistry) {
			const data = (fs.readFileSync(storeregistry)).toString();
			const obj = JSON.parse(data);
			if (obj.useFlag == true) {

				console.log("ERROR: STORE ALREADY IN USE")
				return false;
			}
			else {
				fs.writeFileSync(storeregistry, JSON.stringify({ useFlag: true }));
				return true;
			}
		}
		//if path not provided it checks with default path(public documents)
		if (dirpath === undefined) {
			this.dirpath = "C:/Users/Public/Documents/FSDB";
			
			//if there is no store it creates it
			if (!fs.existsSync(this.dirpath)) {
				console.log("using default dirpath (public documents)");
				shelljs.mkdir('-p', this.dirpath)
				const store = (this.dirpath + '/store.json');
				const storeregistry = (this.dirpath + '/store-registry.json');
				createStore(store, storeregistry);
				this.store_content = {};
				console.log("new store created");
			}
			//if store is there it try to register and intialize store_content with file data
			else {
				const storeregistry = (this.dirpath + '/store-registry.json');
				if(registerStore(storeregistry))
				console.log("using default dirpath (public documents)");
				const store = (this.dirpath + '/store.json');
				const data = fs.readFileSync(store);
				this.store_content = data.toString().length === 0 ? {} : JSON.parse(data.toString());

			}
		}
		//if path provided it checks if it is a valid path and repeat the same process
		else {
			if (dirpath.match(/[a-zA-Z]:[\\/].*/)) {
				this.dirpath = dirpath;
				console.log("matched")
				if (!fs.existsSync(dirpath)) {
					shelljs.mkdir('-p', dirpath)
					const store = (this.dirpath + '/store.json');
					const storeregistry = (this.dirpath + '/store-registry.json');
					createStore(store, storeregistry);
					console.log("new store created");
				}
				else {
					const storeregistry = (this.dirpath + '/store-registry.json');
					registerStore(storeregistry)
					const store = (this.dirpath + '/store.json');
					const data = fs.readFileSync(store);
					this.store_content = data.toString().length === 0 ? {} : JSON.parse(data.toString());

				}
			}
			//if path is invalid it throws error
			else {
				console.log("ERROR: INVALID PATH")
				return;
			}
		}
	}
	//if error occurs it will implicitly call release to release the store

	//method to create new key value pair accepts 3 arguments 1.key(string),2.value(path to json or js object), stamp
	create(key, value, stamp) {
		//checking with key constraints
		if (typeof key === "string" && key.length > 32) {
			this.release();
			console.log("ERROR: KEY LENGTH EXEEDED")
			return;

		}

		else if (typeof key === "string") {
			//handling path to json
			if (typeof value === "string") {
				//check validity of path
				if (value.match(/[a-zA-Z]:[\\/].*/)) {
					//check if file exists
					if (!fs.existsSync(value)) {

						this.release();
						console.log("ERROR: NO JSON FILE IN GIVEN PATH")
						return;


					}
					//if exists check with constraints and create key-val pair
					else {
						const data = fs.readFileSync(value);
						const stats = fs.statSync(value);
						if (stats.size > 16000 || path.extname(value) != ".json") {

							this.release();
							console.log("ERROR: NO JSON OR JSON FILE IS TOO LARGE")
							return;


						}
						else {
							//check if key already exists
							if (this.store_content.hasOwnProperty(key)) {
								//if exists check time to expire if expired overwrite
								if (this.store_content.hasOwnProperty('_stamp') && this.store_content[key][_stamp] < Date.now()) {
									this.store_content[key] = data.toString();
									stamp !== undefined ? this.store_content[key]["_stamp"] = (Date.now() + stamp * 1000) : stamp = 0;
									console.log("data added with key " + key)

								}
								//if not expired throw error
								else {
									this.release();
									console.log("ERROR: KEY ALREADY EXISTS")
									return;


								}
							}
							//key doesn't already exists
							else {
								this.store_content[key] = data.toString();
								stamp !== undefined ? this.store_content[key]["_stamp"] = (Date.now() + stamp * 1000) : stamp = 0;

								console.log("data added with key " + key)

							}
						}
					}
				}
				//invalid path given
				else {
					this.release();
					console.log("ERROR: INVALID PATH TO JSON")
					return;


				}
			}
			//if js object directly given handling the same
			else if (typeof value === "object") {
				if (Buffer.byteLength(JSON.stringify(value), "utf-8") > 16000) {
					this.release();
					console.log("ERROR: JSON FILE TO LARGE")
					return;


				}
				else {

					if (this.store_content.hasOwnProperty(key)) {
						if (this.store_content.hasOwnProperty("_stamp") && this.store_content[key]["_stamp"] < Date.now()) {
							console.log(this.store_content[key]["_stamp"])
							this.store_content[key] = value;
							stamp !== undefined ? this.store_content[key]["_stamp"] = (Date.now() + stamp * 1000) : stamp = 0;
							console.log("data added with key " + key)
						}
						else {
							this.release();
							console.log("ERROR: KEY ALREADY EXISTS")
							return;


						}
					}
					else {
						this.store_content[key] = value;
						stamp !== undefined ? this.store_content[key]["_stamp"] = (Date.now() + stamp * 1000) : stamp = 0;
						console.log("data added with key " + key)

					}
				}
			}
		}
		//if key is not a string throwing an error
		else {
			this.release();
			console.log("ERROR: INVALID KEY")
			return;


		}
	}

	//read method
	read(key) {
		//checking whether key is a valid key
		if (typeof key === "string" && key.length <= 32) {
			//checking whether provided key is present in the system
			if (this.store_content.hasOwnProperty(key)) {
				//cheking whether key is expired
				if (this.store_content.hasOwnProperty("_stamp") && this.store_content["_stamp"] <= Date.now()) {
					this.release();
					console.log("ERROR: KEY EXPIRED")
					return;

				}
				//returing value(result)
				else {
					let result = JSON.parse(JSON.stringify(this.store_content[key]));
					delete result._stamp;
					return result;
				}
			}
			else {
				this.release();
				console.log("ERROR: NO SUCH KEY EXISTS IN STORE")
				return;


			}
		}
		else {
			this.release();
			console.log("ERROR: INVALID SEARCH KEY")
			return;


		}
	}

	delete(key) {
		//checking whether key is a valid key
		if (typeof key === "string" && key.length <= 16) {
			//checking whether provided key is present in the system
			if (this.store_content.hasOwnProperty(key)) {
				//cheking whether key is expired
				if (this.store_content.hasOwnProperty("_stamp") && this.store_content["_stamp"] <= Date.now()) {
					this.release();
					console.log("ERROR: KEY EXPIRED")
					return;

				}
				//returing value(result)
				else {
					delete this.store_content[key]
					console.log("delete successfull")
				}
			}
			else {
				this.release();
				console.log("ERROR: NO SUCH KEY EXISTS IN STORE")
				return;


			}
		}
		else {
			this.release();
			console.log("ERROR: INVALID SEARCH KEY")
			return;


		}
	}

	//releasing store from a client 
	release() {
		fs.writeFileSync((this.dirpath + "/store-registry.json"), JSON.stringify({ useFlag: "false" }));

		fs.writeFileSync((this.dirpath + "/store.json"), JSON.stringify(this.store_content));
		console.log("store released")
	}

}

module.exports = FileStore;
