// jquery实现
(function($) {

    var o = $({});

    $.subscribe = function() {
        o.on.apply(o, arguments);
    };

    $.unsubscribe = function() {
        o.off.apply(o, arguments);
    };

    $.publish = function() {
        o.trigger.apply(o, arguments);
    };

}(jQuery));


// 两者区别
// xx.subscribe('xx', function(a, b, c) {})
// xx.publish('xx', a, b, c);

// $.subscribe('xx', function(e, a, b, c) {}) ; 第一个参数为jquery内建事件对象
// $.publish('xx', [a, b, c]); 要传多个参数，必须用数组包起来


// 自定义实现
function SubPub(elem) {
    this.list = {};
    this.context = elem;
}

SubPub.prototype = {
    constructor: SubPub,
    subscribe: function(name, fn) {
        var names = name.split('.');
        var top_name = names.shift();
        this.list[top_name] = this.list[top_name] || [];
        this.list[top_name].push({
            namespace: name,
            handler: fn
        });
    },

    // 在name命名空间内的都执行
    publish: function(name) {
        var names = name.split('.');
        var top_name = names.shift();
        var handlers = this.list[top_name] || [];
        var param = Array.prototype.slice.call(arguments).slice(1);

        for (var i = 0; i < handlers.length; i++) {
            if (handlers[i].namespace.indexOf(name) >= 0) {
                handlers[i].handler.apply(this.elem, param);
            }
        }
    },

    // 要把在name命名空间下的都删了
    unSubscribe: function(name) {
        var names = name.split('.');
        var handlers = this.list[names[0]] || [];
        for (var i = 0; i < handlers.length; i++) {
            if (handlers[i].namespace.indexOf(name) >= 0) {
                handlers.splice(i, 1);
                i--; // 注意：handlers长度在减小1，i必须减小1
            }
        }
    },
    getLen: function(name) {
        var names = name.split('.');
        var handlers = this.list[names[0]] || [];
        var lens = 0;

        for (var i = 0; i < handlers.length; i++) {
            if (handlers[i].namespace.indexOf(name) >= 0) {
                lens++;
            }
        }
        return lens;
    }
};


