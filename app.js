var myconnect = require('./app/myconnect.js');
var plainEngine = require('./app/plainEngine.js');

var app = myconnect();

// 中间件
app.use(function (req, res, next) {
    console.log('logger');
    next();
});

// 静态资源：其实就是设置中间件
app.static('./public');

// 视图引擎：内部也是中间件，给res添加方法
app.set('views', './view');
app.set('view engine', 'html');
app.engine('html', plainEngine.__express);

// 路由：添加路由中间件
app.get('/', function (req, res) {
    res.render('index');
});

app.listen(5566, function () {
    console.log('listenning on port ' + 5566);
});