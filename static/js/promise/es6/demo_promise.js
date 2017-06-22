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

// 异步嵌套: 每个模块有依赖，也可以没有依赖
(function() {
    function doSomething(arg) {
        console.log('参数为 ' + arg + ' , 1秒后返回结果');
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve(arg * 2);
            }, 1000);
        });
    }

    doSomething(1).then(function(value) {
        return doSomething(value);
    }).then(function(value) {
        return doSomething(value);
    }).then(function(value) {
        return doSomething(value);
    }).then(function(value) {
        return doSomething(value);
    }).then(function(value) {
        return doSomething(value);
    }).then(function(value) {
        final_fn(value);
    });
}());


// 串行: 每个模块有依赖，也可以没有依赖
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
    // excuteMission(missions.shift());
})();


// 并行: 每个模块没有依赖
(function() {
    return;
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
