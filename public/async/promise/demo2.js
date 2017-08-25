function doSomething(val) {

    function cb(resolve, reject) {
        setTimeout(function() {
            resolve(val);
        }, 1000);
    }

    return new Promise(cb);
}

// doSomething(1).then(function(value) {
//     console.log(value);
// }).then(function(value) {
//     console.log(value);
//     return doSomething(2);
// }).then(function(value) {
//     console.log(value);
// });

// 创建一个状态为pending的promise对象
var pending_po = Promise.resolve(0);

// 创建一个状态为resolved or fulfilled的promise对象
var resolved_po = Promise.resolve(1);

// 创建一个状态为resolved的promise对象, 必须传入
var rejected_po = Promise.reject(new Error("error"));

// Promise.all()
(function() {
    var p1 = Promise.resolve(1),
        p2 = Promise.resolve(2),
        p3 = Promise.reject();

    // 非promise对象、状态为resolved的promise对象，才能执行success回调
    // 必须有rejected的promise对象，才能执行error    
    Promise.all([1, 3, p3]).then(function(results) {
        console.log(results); // [1, 2, 3]
    });
})();

// Promise.race()
(function() {
    var p1 = Promise.resolve(1),
        p2 = Promise.resolve(2),
        p3 = Promise.resolve(3);
    Promise.race([p1, p2, p3]).then(function(value) {
        console.log(value); // 1
    });
})();
