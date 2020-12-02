# Freshworks
Backend Assignment
you should run 
1.npm install to download the required packages
2.node test

File System is exposed as a node module it can be imported(use require()) and used
File-store is exposed as json file

Library contains 4 methods

(1).Constructor takes an optional path to intialize or use store 
(2).create takes 3 parameter first 2 are mandatory(key,path/json object) if not provided shows error and an optional time to live parameter
(3).read accepts key and return value
(4).delete accepts key and delete a particular pair if exists
