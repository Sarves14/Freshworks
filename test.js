const FileStore = require("./file-store");
const fs = require("fs");
const path = require("path");

//

let filestore = new FileStore();
// console.log("here"+1)
let filestore1 = new FileStore();
// console.log("here"+2)

filestore1 = new FileStore("sometext");
// console.log("here"+3)

// console.log("here"+4)
filestore1 = new FileStore("c:\\freshworks");
// console.log(1)
let filestore2 = new FileStore("c:\freshworks");

//
filestore.create("key1", path.join(__dirname, "package.json"));

filestore.create("key1", path.join(__dirname, "package.json"));

filestore.create({ msg: "providing invalid key" }, path.join(__dirname, "package.json"));
;
filestore.create("123412341234123412341234123412344", path.join(__dirname, "package.json"));

filestore.create("key2", { name: "freshworks" })
filestore.create("key3", path.join(__dirname, "package-lock.json"));
filestore.create("key4", 1234);

filestore.read("key1")
filestore.read("key6")
filestore.read(1234)

filestore.delete("key1")
filestore.delete("key6")
filestore.delete(1234)



filestore1.release();
filestore.release();





