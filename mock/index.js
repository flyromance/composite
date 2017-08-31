var http = require('http');

var app = http.createServer(function (req, res) {
	console.log(req.url);
	var url = req.url;
	switch (url) {
		case '/dd':
			res.end('123');
			break;
	}
});


var port = process.env.PORT || 5000;
app.listen(port, function () {
	console.log(`server run at ${port}`);
});