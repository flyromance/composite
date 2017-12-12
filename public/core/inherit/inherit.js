function inherit() {
    var args = [].slice.call(arguments);
    if (args.length < 1) throw new Error('不合法');

    var Parent = null;
    function Klass() {

    }
    if (typeof args[0] === 'function') {
        Parent = args[0];
        protoProps = args[1];
        staticProps = args[2];
    } else {
        protoProps = args[0];
        staticProps = args[1];
    }

    if (Parent) {
        // function Mid() {}
        // Mid.prototype = Parent.prototype;
        // Klass.prototype = new Mid();
        // Object.defineProperty(Klass.prototype, {
        //     value: 'constructor',
        //     enumerable: false,
        //     configurable: true,
        //     writable: true,
        // })

        Klass.prototype = Object.create(Parent.prototype, 'constructor', {
            value: Klass,
            enumerable: false,
            configurable: true,
            writable: true,
        })

        Object.setPrototypeOf ? Object.setPrototypeOf(Klass, Parent) : Klass.__proto__ = Parent;

        // 覆盖原型
        for (var key in protoProps) {
            Klass.prototype[key] = protoProps[key];
        }

        // 继承静态
        for (var prop in Parent) {
            Klassp[prop] = Parent[prop];
        }

        // 设置静态
        for (prop in staticProps) {
            Klassp[prop] = staticProps[prop];
        }
    } else {
        
    }



    return Klass;
}


var A = inherit({

})

var B = inherit(A, {}, {})

