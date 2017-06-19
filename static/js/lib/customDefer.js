function customDefer(obj) {
    obj = obj && typeof obj === 'object' ? obj : {};

    Object.defineProperty(obj, '__name__', {
        value: 'customDefer',
        enumerable: false,
        writable: false,
        configurable: false
    });

    var list = {
        done: [],
        fail: []
    };
    var status = 'init';
    var data = null;

    obj.getStatus = function () {
        return status;
    };

    obj.isResolved = function () {
        return status == 'resolved';
    };

    obj.isRejected = function () {
        return status = 'rejected';
    };

    obj.done = function (handler) {
        if (typeof handler !== 'function') return this;

        if (status == 'resolved') { // 如果状态
            handler.call(null, data);
        } else if (status == 'init') {
            list.done.push(handler);
        }

        return this;
    };

    obj.fail = function (handler) {
        if (typeof handler !== 'function') return this;

        if (status == 'rejected') {
            handler.call(null, data);
        } else if (status == 'init') {
            list.fail.push(handler);
        }

        return this;
    };

    obj.resolve = function (res) {
        if (status !== 'init') return this; // 状态只能被修改一次

        status = 'resolved';
        data = res; // 设置这个promise对象的数据
        for (var i = 0; i < list.done.length; i++) {
            list.done[i].call(null, res);
        }

        return this;
    };

    obj.reject = function (res) {
        if (status !== 'init') return this; // 状态只能被修改一次

        status = 'reject';
        data = res; // 设置这个promise对象的数据
        for (var i = 0; i < list.fail.length; i++) {
            list.fail[i].call(null, res);
        }

        return this;
    };

    obj.then = function (done, fail) {
        var promise = customDefer({});

        obj.done(function (data) {
            var ret = done.call(null, data);

            if (ret.__name__ == 'customDefer') {
                ret.done(function (data) {
                    promise.resolve(data);
                }).fail(function (data) {
                    promise.reject(data);
                });
            } else {
                promise.resolve(ret);
            }
        });

        obj.fail(function (data) {
            var ret = fail.call(null, data);

            if (ret.__name__ == 'customDefer') {
                ret.done(function (data) {
                    promise.resolve(data);
                }).fail(function (data) {
                    promise.reject(data);
                });
            } else {
                promise.reject(ret);
            }
        });
    
        return promise;
    };

    obj.promise = function () {
        obj.reject = function () {};
        obj.resolve = function () {};

        return obj;
    };

    return obj;
}

customDefer.all = function (arr) {
    var innerPromise = customDefer({});

    if (!arr) return innerPromise.resolve();

    arr = Array.isArray(arr) ? arr : [arr];
    var remainNum = arr.length;

    for (var i = 0; i < arr.length; i++) {
        var promise = arr[i];
        promise.done(function () {
            check();
        }).fail(function () {
            innerPromise.reject();
        });
    }

    function check() {
        if (--remainNum <= 0) {
            innerPromise.resolve();
        }
    }

    return innerPromise;
};

customDefer.race = function (arr) {
    var innerPromise = customDefer({});

    if (!arr) return innerPromise.resolve();

    arr = Array.isArray(arr) ? arr : [arr];

    for (var i = 0; i < arr.length; i++) {
        var promise = arr[i];
        promise.done(function () {
            innerPromise.resolve();
        }).fail(function () {
            innerPromise.reject();
        });
    }

    return innerPromise;
};

var promise = customDefer();
promise.done(function (data) {

    return '';
    return '';
}).then(function () {}).done(function () {});
