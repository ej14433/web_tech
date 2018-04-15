// Run a node.js web server for local development of a static web site.
// Start with "node server.js" and put pages in a "public" sub-folder.
// Visit the site at the address printed on the console.

// The server is configured to be platform independent.  URLs are made lower
// case, so the server is case insensitive even on Linux, and paths containing
// upper case letters are banned so that the file system is treated as case
// sensitive even on Windows.  All .html files are delivered as
// application/xhtml+xml for instant feedback on XHTML errors.  To improve the
// server, either add content negotiation (so old browsers can be tested) or
// switch to text/html and do validity checking another way (e.g. with vnu.jar).

// Choose a port, e.g. change the port to the default 80, if there are no
// privilege issues and port number 80 isn't already in use. Choose verbose to
// list banned files (with upper case letters) on startup.
'use strict'

var port = 80;
var verbose = true;

// Load the library modules, and define the global constants.
// See http://en.wikipedia.org/wiki/List_of_HTTP_status_codes.
// Start the server:

const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const isPortAvailable = require('is-port-available');
var net = require('net');

var http = require("http");
var fs = require("fs");
var OK = 200, NotFound = 404, BadType = 415, Error = 500;
var types, banned;


//express style
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


app.use(bodyParser());

var checkdoubleslash = function(req, res, next){
  if (req.url.includes("//")){
    return res.send('URL should not contain string //', 400)
  }
  next();
}

app.use(checkdoubleslash, express.static(path.join(__dirname, '/public')));


// Guarding for exceptional errors
/*
Used for admin login

app.all("/admin/*", requireLogin, function(req, res, next) {
  next(); // if the middleware allowed us to get here,
          // just move on to the next route handler
});

app.get("/admin/posts", function(req, res) {
  // if we got here, the `app.all` call above has already
  // ensured that the user is logged in
});
*/

app.get("/:id", function(req, res, next) {
  var url = "./public/" + req.params.id;
  //TODO: LOWER CASE URL
  // URL can not contain //
  if(!url.includes("//")){
    if(!url.endsWith("/")){     //make sure url ends with / or send redirect signal
      if(fs.existsSync(url + "/")){  // make sure such folder exist
        return res.redirect(url + "/", 302);
      }else if(fs.existsSync(url + ".html")){ //if no folder, try .html
        res.setHeader('content-type', 'text/html; charset=utf-8');
        return res.render(req.params.id);
      }else{
        next();
      }
    }else {
      next();
    }
    //invalid url
  }else{
    return res.send('URL should not contain string //', 400)
  }
  next();
});

// app.get("/:id/", function(req, res, next) {
//   console.log("?")
//   var url = "./public/" + req.params.id;
//   if(fs.existsSync(url + "/index.html")){
//             console.log("inside render");
//     res.render(req.params.id + "/index.html");
//   }else{
//     console.log("inside next")
//     next();
//   }
// });


app.get("*", function(req, res, next) {
  res.send('Page not found', 404)
});

isPortAvailable(port).then( status =>{
    if(status){
      app.listen(port, function(){
        console.log('Listening on port ' + port); //Listening on port 8888
      });
    }else{
      port = 8080;
      app.listen(port, function(){
        console.log('Listening on port ' + port); //Listening on port 8888
      });
    }
});

//
// //node.js style
// // Start the http service. Accept only requests from localhost, for security.
// function start() {
//     if (! checkSite()) return;
//     types = defineTypes();
//
//     banned = [];
//     banUpperCase("./public/", "");
//     var service = http.createServer(handle);
//     service.listen(port, "localhost");
//     var address = "http://localhost";
//     if (port != 80) address = address + ":" + port;
//     console.log("Server running at", address);
// }
//
// // Check that the site folder and index page exist.
// function checkSite() {
//     var path = "./public";
//     var ok = fs.existsSync(path);
//     if (ok) path = "./public/index.html";
//     if (ok) ok = fs.existsSync(path);
//     if (! ok) console.log("Can't find", path);
//     return ok;
// }
//
// // Serve a request by delivering a file.
// function handle(request, response) {
//     var url = request.url.toLowerCase();
//     var type = findType(url);
//     if (isBanned(url)){                                 //check invalid url
//       return fail(response, NotFound, "URL has been banned");
//     }else if (url.endsWith("/")) {//check
//       if (fs.existsSync(url)){
//         url = url + "index.html";
//         type = findType(url);
//       }else {
//         return fail(response, BadType, "Folder not found");
//       }
//     }else{
//       if (type == null){
//         var testurl = "./public" + url + ".html";
//         var testfolder = "./public" + url + "/";
//         if (fs.existsSync(testurl)) {
//           url = url + ".html";
//           type = findType(url);
//         }else if (fs.existsSync(testfolder)){
//           var checkindex = testfolder + "index.html";
//           if(fs.existsSync(checkindex)){
//             url = url + "/index.html";
//             type = findType(url);
//           }else{
//             return fail(response, BadType, "File or Folder not found");
//           }
//         }else{
//           return fail(response, BadType, "File or Folder not found");
//         }
//       }
//     }
//
//   //  if (isBanned(url)) return fail(response, NotFound, "URL has been banned");
//
// //    var type = findType(url);
//     //dealing with HTML and XHTML, New and old browser
//
// //    if (type == null) return fail(response, BadType, "File type unsupported");
//     var file = "./public" + url;
//     fs.readFile(file, ready);
//     function ready(err, content) { deliver(response, type, err, content); }
// }
//
// // Forbid any resources which shouldn't be delivered to the browser.
// function isBanned(url) {
//     if (banexploit(url)) return true
//     for (var i=0; i<banned.length; i++) {
//         var b = banned[i];
//         if (url.startsWith(b)) return true;
//     }
//     return false;
// }
//
// // Find the content type to respond with, or undefined.
// function findType(url) {
//     var dot = url.lastIndexOf(".");
//     var extension = url.substring(dot + 1);
//     return types[extension];
// }
//
// // Deliver the file that has been read in to the browser.
// function deliver(response, type, err, content) {
//     if (err) return fail(response, NotFound, "File not found");
//     var typeHeader = { "Content-Type": type };
//     response.writeHead(OK, typeHeader);
//     response.write(content);
//     response.end();
// }
//
// // Give a minimal failure response to the browser
// function fail(response, code, text) {
//     var textTypeHeader = { "Content-Type": "text/plain" };
//     response.writeHead(code, textTypeHeader);
//     response.write(text, "utf8");
//     response.end();
// }
//
// // Check a folder for files/subfolders with non-lowercase names.  Add them to
// // the banned list so they don't get delivered, making the site case sensitive,
// // so that it can be moved from Windows to Linux, for example. Synchronous I/O
// // is used because this function is only called during startup.  This avoids
// // expensive file system operations during normal execution.  A file with a
// // non-lowercase name added while the server is running will get delivered, but
// // it will be detected and banned when the server is next restarted.
// function banUpperCase(root, folder) {
//     var folderBit = 1 << 14;
//     var names = fs.readdirSync(root + folder);
//     for (var i=0; i<names.length; i++) {
//         var name = names[i];
//         var file = folder + "/" + name;
//         if (name != name.toLowerCase()) {
//             if (verbose) console.log("Banned:", file);
//             banned.push(file.toLowerCase());
//         }
//         var mode = fs.statSync(root + file).mode;
//         if ((mode & folderBit) == 0) continue;
//         banUpperCase(root, file);
//     }
// }
//
// function banexploit(url){
//   if(url.includes("/.") || url.includes("//") || url.includes(" ")){
//     return true;
//   }
// }
//
// // The most common standard file extensions are supported, and html is
// // delivered as "application/xhtml+xml".  Some common non-standard file
// // extensions are explicitly excluded.  This table is defined using a function
// // rather than just a global variable, because otherwise the table would have
// // to appear before calling start().  NOTE: add entries as needed or, for a more
// // complete list, install the mime module and adapt the list it provides.
// function defineTypes() {
//     var types = {
//         html : "application/xhtml+xml",
//         css  : "text/css",
//         js   : "application/javascript",
//         png  : "image/png",
//         gif  : "image/gif",    // for images copied unchanged
//         jpeg : "image/jpeg",   // for images copied unchanged
//         jpg  : "image/jpeg",   // for images copied unchanged
//         svg  : "image/svg+xml",
//         json : "application/json",
//         pdf  : "application/pdf",
//         txt  : "text/plain",
//         ttf  : "application/x-font-ttf",
//         woff : "application/font-woff",
//         aac  : "audio/aac",
//         mp3  : "audio/mpeg",
//         mp4  : "video/mp4",
//         webm : "video/webm",
//         ico  : "image/x-icon", // just for favicon.ico
//         xhtml: undefined,      // non-standard, use .html
//         htm  : undefined,      // non-standard, use .html
//         rar  : undefined,      // non-standard, platform dependent, use .zip
//         doc  : undefined,      // non-standard, platform dependent, use .pdf
//         docx : undefined,      // non-standard, platform dependent, use .pdf
//     }
//     return types;
// }
