if (window.Promise) {
    window._Promise = window.Promise;
}
const STATE = {
    pending: 0,
    resolved: 1,
    rejected: -1,
}

function NOOP() {}

function isFunction(fn) {
    return typeof fn === 'function';
}

function isArray(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
}

function Promise(func) {
    this.state = STATE.pending,
    this.queue = [];
    this.value = void 0;
    safelyResolveThen(this, func);
}

function safelyResolveThen(promise, func) {
    var called = false;
    try {
        func(function (val) {
            if (called) return;
            called = true;
            doResolve(promise, val);
        }, function (err) {
            if (called) return;
            called = true;
            doReject(promise, err);
        });
    } catch (error) {        
        called = true;
        doReject(promise, err);
    }
}

Promise.prototype.then = function (onResolve, onReject) {
    var promise = new Promise(NOOP);

    this.queue.push(new QueueItem(promise, onResolve, onReject));

    return promise;
}

Promise.prototype.catch = function (onReject) {
    return this.then(null, onReject);
}

function QueueItem(promise, onResolve, onReject) {
    this.callResolve = function (val) {
        unwrap(promise, onResolve, val);
    }
    this.callReject = function (val) {
        unwrap(promise, onReject, val);
    }
}

function unwrap(promise, func, val) {
    var returnVal = func(val);

    doResolve(promise, returnVal);
}

function doResolve(promise, val) {

    // 如果回调函数返回的是promise
    if (val instanceof Promise) {
        val.then(function(val) {
            doResolve(promise, val);
        }, function(err) {
            doReject(promise, err);
        });
    } else {
        promise.state = STATE.resolved;
        promise.value = val;
        promise.queue.forEach(function (queueItem) {
            queueItem.callResolve(val); 
        });    
    }
}

function doReject(promise, err) {
    promise.state = STATE.rejected;
    promise.value = err;
    promise.queue.forEach(function (item) {
        item.callReject(err);
    });
}