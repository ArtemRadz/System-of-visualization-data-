var express = require('express');
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var readline = require('readline');
var stream = require('stream');

var app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', function(req, res){
	var arr = [];
  // create an incoming form object
  var form = new formidable.IncomingForm();

  // every time a file has been uploaded successfully,
  form.on('file', function(field, file) {
      var instream = fs.createReadStream(file.name);
      var outstream = new stream;
      var rl = readline.createInterface(instream, outstream);

    rl.on('line', function(line) {
      arr.push(line);
    });

    rl.on('close', function() {
    	var supportArr = [];
    	for(var i = 0; arr.length > i; i++) {
    		supportArr.push(arr[i].match(/\w+|"[^"]+"/g))
    	}
      res.end(JSON.stringify(supportArr));
    });
  });

  // log any errors that occur
  form.on('error', function(err) {
    res.end(err);
  });

  // parse the incoming request containing the form data
  form.parse(req);
});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});