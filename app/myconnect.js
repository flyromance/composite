var http = require('http');
var path = require('path');
var util = require('util');
var events = require('events');
var url = require('url');
var parse = url.parse;
var querystring = require('querystring');
var fs = require('fs');

var ejs = require('ejs');

function Connect() {
    if (!(this instanceof Connect)) {
        return new Connect();
    }
    this.init();
}

var methodMap = {
    get: 1,
    post: 2
};

var extNameMap = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript', // application/x-javascript || text/javascript
    'json': 'application/json',
    'png': 'image/png',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif'
};

Connect.prototype = {
    init: function () {
        this.list = []; // 中间件
        this.routes = {
            // get: [ {test: /xx/g, handler: function () {}} ]
            // get : {
            //     '/': function () {};
            // }
        };
        this.engines = {};
        this.viewengine = 'ejs'; // 设置默认extname为 ejs
        this.engine('ejs', ejs.__express); // 设置默认的渲染引擎为 ejs

        this.hasAddRoute = false;

        this.createServer();
    },

    // 中间件
    // 路由 use()
    use: function (handler) {
        var that = this;

        typeof handler === 'function' && this.list.push(handler);
    },

    // 路由设置：get('/', function(req, res) {})
    get: function (rule, handler) {
        var that = this;

        that.setRequestMethod('get', rule, handler);
    },

    post: function () {
        var that = this;

        that.setRequestMethod('post', rule, handler);
    },

    setRequestMethod: function (method, rule, handler) {
        var that = this;
        that.addRouteMiddleware();

        if (methodMap[method]) {
            var routes = (that.routes['get'] = that.routes['get'] || {});

            if (util.isObject(rule)) {
                util._extend(routes, rule);
            } else {
                routes[rule] = handler;
            }
        }
    },

    engine: function (ext, handler) {
        var that = this;

        if (util.isObject(ext)) {
            util._extend(that.engines, ext);
        } else if (util.isString(ext)) {
            that.engines[ext] = handler;
        }
    },

    // 设置视图文件
    // app.engine('html', ejs.__express);
    // app.set('view engine', 'html');
    set: function () {
        var that = this;

        var args = [].slice.call(arguments);
        switch (args[0]) {
            case 'views':
                var viewpath = this.viewpath = path.resolve(process.cwd(), args[1]);
                
                // 注册中间件
                that.use(function (req, res, next) {
                    console.log('view');
                    if (!res.render) {
                        res.render = function (name, data) {
                            var extname = path.extname(name); // .html
                            var basename;
                            if (!extname) {
                                extname = '.' + that.viewengine;
                                basename = name + extname;
                            } else {
                                basename = path.basename(name);
                            }
                        
                            var filepath = path.resolve(viewpath, basename);
                            var engine = that.engines[extname.slice(1)];
                            !engine && (engine = that.engines.ejs);
                            engine(filepath, function (data) {
                                res.writeHeader(200, {
                                    'Content-Type': 'text/html',
                                    'Content-Length': Buffer.byteLength(data)
                                });
                                res.end(data);
                            });
                        };
                    }

                    next();
                });
                break;
            case 'view engine':
                that.viewengine = args[1];
                break;
            default:
                break;
        }
    },

    // 视图文件
    static: function (name) {
        var that = this;

        // 项目目录 + '/' + 'name'
        var staticPath = this.staticPath = path.resolve(process.cwd(), name);

        // 静态资源中间件
        that.use(function (req, res, next) {
            console.log('static');
            var pathname = parse(req.url).pathname;
            var filepath = path.join(that.staticPath, pathname);

            // 先判断是否是静态资源
            fs.stat(filepath, function (err, stat) {
                if (err) {
                    console.log(err);
                    
                    next(); // 不存在，往下执行route匹配
                }
                if (stat && stat.isFile()) {
                    var extname = path.parse(filepath).ext.slice(1);

                    fs.readFile(filepath, { encoding: 'utf8' }, function (err, data) {
                        if (err) {
                            console.log('error', filepath, err);
                        } else {
                            console.log('read', filepath);
                            var contentType = extNameMap[extname] || 'text/plain';
                            res.setHeader('Content-Type', contentType);
                            res.setHeader('Content-Length', Buffer.byteLength(data));
                            res.statusCode = 200;
                            res.end(data);
                            // res.writeHeader(200, {
                            //     'Content-Type': contentType,
                            //     'Content-Length': Buffer.byteLength(data)
                            // });
                            // res.write(data);
                            // res.end();
                        }
                    });
                    
                } else {
                    next();
                }
            });
        });
    },

    addRouteMiddleware: function () {
        var that = this;

        if (that.hasAddRoute) return;

        that.use(function (req, res, next) {
            console.log('route');

            var method = req.method;
            var parsedUrl = parse(req.url);
            var pathname = parsedUrl.pathname;
            var path = parsedUrl.path;
            console.log(method, pathname, path);
            console.log(that.routes.get);
            switch (method) {
                case 'GET':
                    for (var key in that.routes.get) {
                        if (key === pathname) { 
                            that.routes.get[key](req, res);
                        }
                    }
                    break;
                case 'POST':
                    that.handlePost(req, res);
                    break;
                default:
                    break;
            }
            next();
        });
    },

    createServer: function () {
        var that = this;

        var server = that.server = http.Server();

        server.on('request', function (req, res) {

            function next() {
                var handler = that.list.shift();
                typeof handler === 'function' && handler.apply(that, [req, res, next]);
            }

            next(); // 调用中间件
        });
    },
    listen: function (port, cb) {
        var that = this;

        port = +port || 5566;

        // 404页面
        that.use(function (req, res) {
            res.writeHeader(404);
            res.end();
        });

        that.server.listen(port, function () {
            typeof cb === 'function' && cb.call();
        });
    },

}

module.exports = function () {
    return new Connect();
};
