// http://javascript.ruanyifeng.com/advanced/promise.html#toc6

// 场景：有6个异步模块，每个模块完成之后才能执行最后一个模块
function async(arg, cb) {
    console.log('参数为 ' + arg + ' , 1秒后返回结果');
    setTimeout(function() {
        cb.call(null, arg * 2);
    }, 1000);
}

function final_fn(arg) {
    console.log('参数为 ' + arg + ' , final...');
}

// 异步嵌套: 模块依赖没有要求
(function() {
    async(1, function(value) {
        async(value, function(value) {
            async(value, function(value) {
                async(value, function(value) {
                    async(value, function(value) {
                        async(value, final_fn);
                    });
                });
            });
        });
    });
}());


// 串行: 模块依赖没有要求
(function() {
    var missions = [1, 2, 3, 4, 5, 6];
    var result = [];

    function excuteMission(mission) {
        if (mission) {
            async(mission, function(value) {
                result.push(value);
                excuteMission(missions.shift());
            });
        } else {
            final_fn(result);
        }
    }
    excuteMission(missions.shift());
})();


// 并行: 必须保证模块没有依赖
(function() {
    // return;
    var items = [1, 2, 3, 4, 5, 6];
    var results = [];
    items.forEach(function(item) {
        async(item, function(result) {
            results.push(result);
            if (results.length == items.length) {
                final_fn(results);
            }
        });
    });
})();
