var express = require('./app/lib/express.js');
var bodyParser = require('./app/lib/bodyParser.js');
var plainEngine = require('./app/plainEngine.js');
var path = require('path');

var app = express();

app.use(function (req, res, next) {
    console.log('middleware 1...');
    next();
});

app.use(function (req, res, next) {
    console.log('middleware 2...');
    next();
});

// bodyParser中间件
app.use(bodyParser);

// 静态资源
app.use(express.static(path.join(__dirname, 'public')));

// 视图目录
app.set('views', './view');
app.set('view engine', 'html');
app.engine('html', plainEngine.__express);

// 路由处理
app.use('/', function (req, res) {
    console.log('middleware route:/');
    res.send('hello world...');
});

app.use('/index', function (req, res) {
    console.log('middleware route:/index');
    res.render('index');
});

app.use(function (req, res) {
    console.log('middleware route...');
    res.send(404, 'haha Not Found');
});

app.listen(5566, function () {
    console.log('server start on port 5566...');
});
