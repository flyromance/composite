// es6代码
class CC {
    constructor() {
        this.name = 123
    }
    sayName() {}
}

class MM extends CC {
    constructor() {
        super()
        this.name = 321
    }

    sayName() {

    }

    // 不支持
    // say = 1 => 实例属性
    // static say = 2 => 静态属性
    static say() {}
}

// 编译后的es5代码
"use strict";

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, { 
        constructor: { value: subClass, enumerable: false, writable: true, configurable: true } 
    });

    if (superClass) {
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var CC = function () {
    function CC() {
        _classCallCheck(this, CC);

        this.name = 123;
    }

    _createClass(CC, [{
        key: "sayName",
        value: function sayName() {}
    }], [{
        key: "say",
        value: function say() {}
    }]);

    return CC;
}();

var MM = function (_CC) {

    function MM() {

        // 确保调用类的正确姿势：new MM()
        _classCallCheck(this, MM);

        // 执行父类的构造函数constructor
        // 检查其返回结果
        var _this = _possibleConstructorReturn(this, (MM.__proto__ || Object.getPrototypeOf(MM)).call(this));

        _this.name = 321;
        return _this;
    }

    // 继承父类的静态方法和实例方法
    _inherits(MM, _CC); 

    // 覆盖从父类继承的静态属性和实例方法
    _createClass(MM, [{
        key: "sayAge",
        value: function sayAge() {}
    }, {
        key: "sayName",
        value: function sayName() {}
    }]);

    return MM;
}(CC);

