var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var querystring = require('querystring');
var util = require('util');
var ejs = require('ejs')

function wrapReq(req) {
    var parsedUrl = url.parse(req.url, true); // 传了true，就不用querystring.parse在转了
    req.query = parsedUrl.query;
}

function wrapRes(res) {
    res.send = function (val) {
        if (util.isString(val)) {
            res.end(val);
        }

        if (util.isNumber(val)) {
            res.writeHead(val, arguments[1]);
            res.end();
        }

        if (util.isObject(val)) {
            res.end(JSON.stringify(val));
        }
    };

    res.json = function (obj) {
        if (util.isObject(val)) {
            res.end(JSON.stringify(val));
        }
    };
}

function express() {

    var list = [];

    function app(req, res) {
        var i = 0;

        wrapReq(req);
        wrapRes(res);
        console.log(list);

        function next() {
            var item = list[i++];

            if (!item) return;

            if (item.route === null ||
                item.route == url.parse(req.url, true).pathname) {
                typeof item.handler === 'function' && item.handler.apply(null, [req, res, next]);
            } else {
                next();
            }
        }

        next();
    }

    app.use = function (name, handler) {
        if (typeof name == 'function') {
            list.push({
                route: null,
                handler: name
            });
        } else {
            list.push({
                route: name,
                handler: handler
            });
        }
    };

    var defaultExtname = 'ejs';
    var engines = {};
    app.set = function (type, val) {
        if (type == 'views') {
            var viewPath = path.resolve(process.cwd(), val);

            app.use(function (req, res, next) {
                res.render = function (name, data) {
                    var filePath = path.join(viewPath, name); 
                    var extname = path.extname(filePath).slice(1);
                    if (!extname) extname = defaultExtname;
                    filePath += '.' + extname;
                    engine = engines[extname] || ejs.__express;console.log(filePath);
                    engine(filePath, function (data) {
                        res.writeHead(200, 'ok', {
                            'Content-Type': 'text/html'
                        });
                        res.write(data);
                        res.end();
                    });
                };

                next();
            });
        } else if (type == 'view engine') {
            defaultExtname = val || defaultExtname;
        }
    };

    app.engine = function (type, handler) {
        if (typeof type === 'string' && typeof handler === 'function') {
            !engines[type] && (engines[type] = handler);
        }
    };

    var server = http.createServer(app);

    app.listen = function (port, cb) {
        port = port || 5566;console.log(port);
        server.listen(port, function () {
            cb.call();
        });
    };

    return app;
}

var extMap = {
    '*': 'text/plain',
    'html': 'text/html',
    'js': 'application/javascript',
    'css': 'text/css',
    'png': 'image/png'
}

express.static = function (staticPath) {

    return function (req, res, next) {
        var pathObj = url.parse(req.url, true);
        var filePath = path.resolve(staticPath, pathObj.pathname.slice(1));
        console.log(filePath);

        // {encoding: 'utf8'}
        fs.readFile(filePath, function (err, data) {
            if (err) {
                next();
            } else {
                var extname = path.extname(filePath) || '*';
                var fileType = extMap[extname.slice(1)];
                res.writeHead(200, 'ok', {
                    'Content-Type': fileType, 
                    // 'Content-Length': Buffer.byteLength(data)
                });
                // res.statusCode = 200;
                // res.statusMessage = 'ok';
                // res.setHeader('Content-Type', fileType);
                res.write(data, 'binary'); // 默认是'utf8'
                res.end();
            }
        });
    }
};

module.exports = express;
