// Server which delivers only static HTML pages (no content negotiation).
// Response codes: see http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
// When the global data has been initialised, start the server.
var HTTP = require('http');
var FS = require('fs');
var OK = 200, NotFound = 404, BadType = 415;
start(8080);

// Provide a service to localhost only.
function start(port) {
  var service = HTTP.createServer(handle);
  service.listen(port, 'localhost');
  console.log("Visit localhost:" + port);
}

// Deal with a request.
function handle(request, response) {
  var url = request.url;
  if (url.endsWith("/")) url = url + "index.html";
  if (! url.endsWith(".html")) return fail(response, BadType, "Not .html");
  var file = "./public" + url;
  FS.readFile(file, ready);
  function ready(err, content) { reply(response, err, content); }
}

// Send a reply.
function reply(response, err, content) {
  if (err) return fail(response, NotFound, "File not found: " + err);
  var hdrs = { 'Content-Type': 'application/xhtml+xml' };
  response.writeHead(OK, hdrs);
  response.write(content);
  response.end();
}

// Send a failure message
function fail(response, code, message) {
  var hdrs = { 'Content-Type': 'text/plain' };
  response.writeHead(code, hdrs);
  response.write(message);
  response.end();
}
