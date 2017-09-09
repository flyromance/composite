/*
0、命名空间管理
1、类型判断：isArray isFunction isArrayLike isPlainObject isObject isEmptyObject ...
1、对象属性(深)扩展：extend、mixin、assign、clone、keys
  - 字符串：trim、转义escape、反转义unescape、计算长度getStrLen、截断truncStr
  - 数组扩展：indexOf、lastIndexOf、forEach、map、filter、some、every、reduce
  - 函数扩展：bind(curry)
2、类继承createClass
3、原生事件
4、自定义事件
5、节流、防抖
4、each
9、预传参curry
6、轮询poll、await
7、queryString、getSearchParam、encodeURIJson
8、cookie操作
9、判断一个元素是否在可视区
10、加载script
*/

(function(g, factory) {
  if (typeof module !== undefined && typeof exports !== undefined) {
    module.exports = factory(g);
  } else if (typeof define === 'function' && define.amd) {
    define('util', function() {
      return factory(g)
    })
  } else {
    var _util = g.util;
    var util = factory(g);
    util.noConfilect = function() {
      g.util = _util;
      return util
    }
    g.util = util;
  }
})(this, function(g) {
  var util = {};

  function type(val) {
    return Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
  }

  function isWindow(val) {
    return val && val.window === val
  }

  // typeof null == 'object'; typeof Array Date Symbol === 'function'
  function isObject(val) {
    return val != null && typeof val === 'object' || typeof val === 'function';
  }

  // 不能写 val instanceof Object, 因为 [] instanceof Object 也是true，但是[]不是纯对象
  function isPlainObject(val) {
    try {
      return val != null && typeof val === 'object' && val.constructor.prototype.hasOwnProperty('hasOwnProperty')
    } catch () {
      return false
    }
  }

  function isEmptyObject(val) {
    if (!isObject(val)) return false

    for (var key in val) {
      return false
    }
    return true
  }

  // 不能 val instanecof Array, 因为Array 有可能是iframe中的
  function isArray(val) {
    return type(val) === 'array';
  }

  Array.isArray = typeof Array.isArray === 'function' ? Array.isArray : isArray;

  //
  function isArrayLike(val) {
    var len = 'length' in val && val.length;
    return isArray(val) || (typeof len === 'number' && len === 0 || (len > 0 && val.length - 1 in val))
  }

  function isFunction(val) {
    return typeof val === 'function'
  }

  function extend() {
    var target, sources, source, _isPlainObject, i, key, tar, src, clone,
      deep = false,
      _isArray = false,
      args = Array.prototype.slice.call(arguments);

    // 处理第一个参数为布尔值
    if (typeof args[0] === 'boolean') {
      deep = args[0];
      args = args.slice(1);
    }

    // 处理扩展this还是扩展传入的参数
    if (args.length == 1) {
      target = this;
      sources = args;
    } else {
      target = args[0];
      sources = args.slice(1);
    }

    // 处理传入的不是对象的情况
    if (!isObject(target)) target = {};

    for (i = 0; i < sources.length; i++) {
      source = sources[i];
      for (key in source) {
        tar = target[key];
        src = source[key];
        if (deep && ((_isArray = isArray(src)) || isPlainObject(src))) {
          if (_isArray) {
            clone = tar && isArray(tar) ? tar : [];
          } else {
            clone = tar && isPlainObject(tar) ? tar : {};
          }

          target[key] = extend(deep, clone, src);
        } else if (typeof tar === 'undefined') {
          target[key] = src
        }
      }
    }
  }

  util.extend = extend;

  util.extend({
    type: type,
    isWindow: isWindow,
    isObject: isObject,
    isPlainObject: isPlainObject,
    isEmptyObject: isEmptyObject,
    isFunction: isFunction,
    isArray: isArray,
    isArrayLike: isArrayLike
  });

  function clone(src, deep) {
    var _isArray, copy, i, key;

    if (!(_isArray = isArray(src)) && !isPlainObject(src)) return src;

    if (_isArray) {
      copy = [];
      for (var i = 0; i < src.length; i++) {
        copy[i] = deep === true ? clone(src[i], deep) : src[i];
      }
    } else {
      copy = {};
      for (var key in src) {
        copy[key] = deep === true ? clone(src[key], deep) : src[key];
      }
    }

    return copy;
  }

  // override 强制覆盖
  function mixin(des, src, override) {
    for (var key in src) {

      // todo: !(des[key] || (key in des))
      if (override || !(key in des)) {
        des[key] = src[key]
      }
    }
    return des
  }

  // 没有hasOwnProperty的限制
  function assign(des, src) {
    return mixin(des, src, true)
  }

  Object.assign = isFunction(Object.assign) ? Object.assign : assign;

  function keys(obj) {
    var ret = [];
    if (!isObject(obj)) return ret
    if (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        ret.push(key)
      }
    }
    return ret
  }

  Object.keys = isFunction(Object.keys) ? Object.keys : keys;

  util.extend({
    clone: clone,
    mixin: mixin,
    assign: assign,
    keys: keys
  });

  function each(tar, handler) {
    if (!isFunction(handler)) return
    if (isArray(tar)) {
      for (var i = 0; i < tar.length; i++) {
        if (handler.call(tar[i], item, i, tar) === false) {
          break;
        }
      }
    } else if (isPlainObject(tar)) {
      for (var key in tar) {
        if (handler.call(tar[key], item, key, tar) === false) {
          break;
        }
      }
    }
  }

  function indexOf(arr, ) {

  }

  function lastIndexOf() {

  }

  function map() {

  }

  function filter() {

  }

  function some() {

  }

  function every() {

  }

  function reduce() {

  }

  function reduceRight() {

  }

  util.extend({

  });

  function curry(fn, context) {
    var _args = Array.prototype.slice.call(arguments, 2);

    return function() {
      var args = Array.prototype.slice.call(arguments);
      fn.apply(context, _args.concat(args));
    }
  }

  function bind(fn, context) {
    return curry.apply(null, arguments);
  }

  Function.prototype.bind = Function.prototype.bind ? Function.prototype.bind : function() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(this);
    return curry.apply(null, args)
  }

  util.extend({
    curry: curry,
    bind: bind
  });

  // 防抖：时间间隔大于xx才会触发
  function debounce(fn, interval) {
    var timer = null;
    interval = typeof interval === 'number' ? interval : 200;

    return typeof fn !== 'function' ? function() {} :
      function() {
        var that = this;
        var args = arguments;

        clearTimeout(timer);
        setTimeout(function() {
          fn.apply(that, args);
        }, interval)
      }
  }

  // 节流：必须大于xx才会触发；超过一定时间ss必须触发
  function throttle(fn, interval, max) {
    var timer = null;
    var lastTime = null;
    interval = typeof interval === 'number' ? interval : 200;
    max = typeof max === 'number' ? max : 500;

    return typeof fn !== 'function' ? function() {} :
      function() {
        var that = this,
          args = arguments,
          nowTime = +new Date();
        lastTime = lastTime || nowTime;

        clearTimeout(timer);
        if (nowTime - lastTime >= max) {
          lastTime = null;
          fn.apply(that, args);
        } else {
          setTimeout(function() {
            lastTime = null;
            fn.apply(that, args);
          }, interval);
        }
      }
  }

  // 创建一个类型
  function createClass(Father, protoProp, staticProp) {
    // 参数处理
    if (typeof Father !== 'function') {
      staticProp = protoProp;
      protoProp = Father;
      Father = function() {}
    }

    // 构造函数
    function Child() {
      if (!(this instanceof Child)) {
        return new Child()
      }
      if (typeof this._init === 'function') {
        this._init.apply(this, arguments);
      }
    }

    Child.prototype = new Father();
    Child.prototype.constructor = Child;
    Child.father = Father;

    // 原型覆盖
    if (isPlainObject(protoProp)) {
      for (var key in protoProp) {
        if (key !== 'constructor') {
          Child.prototype[key] = protoProp[key];
        }
      }
    }

    if (typeof Child.prototype._init !== 'function') {
      Child.prototype._init = function() {}
    }

    // 静态覆盖
    if (isPlainObject(staticProp)) {
      mixin(Father, staticProp)
    }

    return Father
  }

  util.extend({
    createClass: createClass,
    inherit: createClass
  });

  var CustomEvent = createClass({
    _init: function() {
      this.___cache = {};
    },
    on: function(type, handler) {

    },
    off: function(type, handler) {

    },
    fire: function() {

    }
  });

  // 自定义事件
  util.customEvent = function(obj) {
    obj = isPlainObject(obj) ? obj : {};
    extend(obj, new CustomEvent());
    return obj
  }

  if (typeof Object.create !== 'function') {
    // definedProp与Object.defineProperties(obj, xxx)中的xxx一样
    Object.create = function(proto, definedProp) {
      return new createClass()
    }
  }

  // 注意转码问题
  function queryString(str, key, separator, connector) {
    separator = separator || '&';
    connector = connector || '=';
    if (!str || !key || typeof str !== 'string' || typeof key !== 'string') return null;
    var re = new RegExp('(?:^|' + separator + ')' + encodeURIComponent(key) + connector + '([^' + separator + connector + ']*)');
    var match = str.match(re);
    return match ? decodeURIComponent(match[1]) : null
  }

  function queryUrl(key) {
    // 切掉？号
    return queryString(window.location.search.slice(1), key)
  }

  // todo: 数组和对象
  function jsonToStr(obj, separator, connector) {
    separator = separator || "&";
    connector = connector || "=";
    var ret = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        ret.push(encodeURIComponent(key) + connector + encodeURIComponent(obj[key]));
      }
    }
    return ret.join(separator)
  }

  // todo: 考虑数组和对象
  function strToJson(str, separator, connector) {
    separator = separator || "&";
    connector = connector || "=";
    var result = str.split(separator);
    var ret = {};
    each(result, function(item, index) {
      var key, value;
      key = item.split(connector)[0];
      value = item.split(connector)[1];
      ret[key] = value;
    });
    return ret;
  }

  // cookie操作
  var Cookie = {
    json: function() {
      return strToJson(document.cookie, '; ', '=')
    },
    get: function(key) {
      return queryString(document.cookie, key, '; ', '=')
    },
    set: function(key, value, options) {
      options = options || {};
      if (!value) options.expires - 1;

      var expires = options.expires,
        _expires;
      if (typeof expires == 'number') {
        _expires = new Date(+new Date() + expires);
      } else if (expires instanceof Date) {

      } else if (typeof expires === 'string') {
        var timeType = value.slice(value.length - 1).toLowerCase();
        var num = Number(value.slice(0, -1));
        switch (expires) {
          case 'y':
            _expires = num * 365 * 24 * 60 * 60 * 1000;
            break;
          case 'm':
            _expires = num * 30 * 24 * 60 * 60 * 1000;
            break;
          case 'd':
            _expires = num * 24 * 60 * 60 * 1000;
          case 'h':
            _expires = num * 60 * 60 * 1000;
            break;
          case 'minute':
            _expires = num * 60 * 1000;
            break;
          case 's':
          default:
            _expires = num * 1000;
            break;
        }

        _expires = new Date(+new Date() + _expires);
      }

      document.cookie = encodeURIComponent(key) + '=' + encodeURIComponent(value) + ';' +
        (options.domain ? 'domain=' + options.domain + ';' : '') +
        (options.path ? 'path=' + options.path + ';' : '') +
        (_expires ? 'expires=' + _expires.toGMTString() + ';' : '') +
        (options.secure ? 'secure;' : '')
    },
    remove: function(key) {
      Cookie.set(key, '', {
        expires: -1 // 数字 或者 时间对象
      })
    }
  }

  // 轮询condition
  // success: 再max次内，并且condition返回true
  // error: condition返回false，condition执行有错误，超时
  function poll(condition, interval, max, success, error) {
    var times = 0;

    function execute() {
      if (condition() === true) {
        success();
      } else if (condition() === false) { 
        error('error');
      } else {
        setTimeout(function() {
          times++;
          if (times > max) {
            error('timeout');
          } else {
            execute();
          }
        }, interval);
      }
    }

    execute();
  }

  // 获取对于视窗的位置集合
  // ie5以上都能支持，但是又一点点地方需要修正一下，
  // IE67的left、top会少2px,并且没有width、height属性。
  function getOffset(elem) {
    var offset = elem.getBoundingClientRect();
    return offset;
  }

  function top(elem, threshold) {
    threshold = threshold || {};
    var offset = getOffset(elem);
    var windowHeight = window.innerHeight;
    var scrollTop = document.scrollTop || document.body.scrollTop || 0;
    return offset.top + (threshold.top || 0) < scrollTop + windowHeight;
  }

  function bottom(elem, threshold) {
    threshold = threshold || {};
    var offset = getOffset(elem);
    var scrollTop = document.scrollTop || document.body.scrollTop || 0;
    return offset.top + offset.height + (threshold.bottom || 0) > scrollTop
  }

  function inView(elem, threshold) {
    return top(elem, threshold) && bottom(elem, threshold)
  }

  return util;
});