var http = require('http');
var parse = require('url').parse;
var querystring = require('querystring');
var path = require('path');
var fs = require('fs');

var server = http.createServer(function (req, res) {
	var url = parse(req.url);

	if (url.pathname.indexOf('/static') == 0) {
		fs.readFile('.' + url.pathname, 'utf-8', function (err, data) {
			if (err) {
				console.log('error');
				res.statusCode = 404;
				res.end('not found...');
			} else {
				var ext = path.parse(url.pathname).ext.substring(1);
				var type = 'text/plain';
				switch (ext) {
					case 'js':
						type = 'application/javascript';
						break;
					case 'css':
						type = 'text/css';
						break;
					case 'png':
						type = 'image/png';
						break;
					case 'jpg':
						type = 'image/jpg';
						break;
					default:
						break;
				}
				res.setHeader('Content-Length', data.length);
				res.setHeader('Content-Type', type);
				res.statusCode = 200;
				res.write(data);
				res.end();
			}
		});
	} else {
		var filename;
		if (url.path == '/') {
			filename = 'index.html';
		} else {
			filename = url.pathname;
		}

		fs.readFile(__dirname + '/view/' + filename, 'utf-8', function (err, data) {
			if (err) {
				console.log('error');
				res.statusCode = 404;
				res.end('not found...');
			} else {
				res.setHeader('Content-Length', data.length);
				res.setHeader('Content-Type', 'text/html');
				// res.setHeader('Connection', 'close');
				res.statusCode = 200;
				res.write(data);
				res.end();
			}
		});
	}
});

server.listen(8899, function () {
	console.log('server listenning 8899...');
});	