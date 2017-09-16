/*
0、命名空间管理
1、通用函数
  - 类型判断：isArray isFunction isArrayLike isPlainObject isObject isEmptyObject ...
  - 扩展：extend、mixin、assign、clone
  - 数组：each、indexOf、lastIndexOf、forEach、map、filter、some、every、reduce
  - 函数：bind、curry、debounce、throttle、轮询poll
  - 字符串：trim、转义escape、unescape、queryString、queryUrl、encodeURIJson、strToJson、jsonToStr、计算长度getStrLen、截断truncStr
2、构造函数静态属性扩展
  - Object.assign keys create
  - Array.isArray
3、构造函数原型扩展
  - Function：bind
  - Array：indexOf、lastIndexOf、forEach、map、filter、some、every、reduce、reduceRight、fill
    (sort、slice、concat、reverse、split、join、push、pop、shift、unshift)
  - String：trim、trimLeft、trimRight、indexOf、lastIndexOf
4、类继承：createClass
5、原生事件
6、自定义事件
7、cookie操作
8、判断一个元素是否在可视区
9、jsonp
10、动画
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

  function namespace(obj, namespace, val) {
    if (typeof obj === 'string') {
      val = namespace;
      namespace = obj;
      obj = window;
    }

    var arr = namespace.split('.');
    for (var i = 0, lens = arr.length; i < lens; i++) {
      obj[arr[i]] = obj[arr[i]] || (i == lens - 1 ? (val || {}) : {});
      obj = obj[arr[i]];
    }

    return obj;
  }

  util.namespace = namespace;

  var ArrayProto = Array.prototype,
    ObjProto = Object.prototype,
    FuncProto = Function.prototype;

  var slice = ArrayProto.slice,
    hasOwnProperty = ObjProto.hasOwnProperty,
    toString = ObjProto.toString;

  function type(val) {
    return toString.call(val).slice(8, -1).toLowerCase()
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
      return val != null && typeof val === 'object' && hasOwnProperty.call(val.constructor.prototype, 'hasOwnProperty')
    } catch () {
      return false
    }
  }

  /**
   * 是否为纯对象
   * @param: Object
   * @return: Boolean
   */
  function isPureObject(obj) {
    // 排除null、undefined、非对象(number/string/boolean)
    // dom对象、window对象：这两个可以省略... {nodeType: 1}
    if (!obj || typeof obj !== 'object' || obj.nodeType || obj.window === obj) {
      return false;
    }

    return hasOwn.apply(obj.constructor.prototype, ['hasOwnProperty']);
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

  /**
   * 类数组转为真数组
   * @param: Object
   * @return: Array
   */
  function toArray(input) {
    var args = Array.prototype.slice.apply(arguments);
    return Array.prototype.slice.apply(input, args.slice(1));
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

  /**
   * clone
   * @notice: 函数不能用JSON.stringify, 要用toString()
   */
  function cloneByJSON(source) {
    if (typeof source != 'object') return source;
    return JSON.parse(JSON.stringify(source));
  }

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



  function indexOf(item, index) {
    for (var i = index || 0; i < this.length; i++) {
      if (item === this[i]) {
        return i
      }
    }

    return -1;
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
    // Array.prototype.indexOf
    indexOf: function(arr, val, index) {
      index = typeof index === 'number' ? index : 0;

      if (index < 0) {
        index = arr.length + index;
      } else if (index >= arr.length) {
        index = arr.length - 1;
      }

      for (var i = index; i < arr.length; i++) {
        if (arr[i] === val) {
          return i;
        }
      }

      return -1;
    },
    lastIndexOf: function(arr, val, index) {
      index = typeof index === 'number' ? index : arr.length;

      if (index < 0) {
        index = arr.length + index;
      } else if (index >= arr.length) {
        index = arr.length - 1;
      }

      for (var i = index; i >= 0; i--) {
        if (arr[i] == val) {
          return i;
        }
      }

      return -1;
    },
    forEach: function(arr, fn) {
      for (var i = 0; i < arr.length; i++) {
        if (false === fn.call(arr[i], arr[i], i)) {
          break;
        }
      }
    },
    map: function(arr, fn) {
      var ret = [];
      for (var i = 0; i < arr.length; i++) {
        arr.push(fn.call(arr[i], arr[i], i));
      }
      return ret;
    },
    filter: function(arr, fn) {
      var ret = [],
        result;
      for (var i = 0; i < arr.length; i++) {
        if (true === fn.call(arr[i], arr[i], i)) {
          arr.push(arr[i]);
        }

      }
      return ret;
    },
    reduce: function(arr, fn, initVal) {
      var index = 0;

      if (typeof initVal === 'undefined') {
        initVal = arr[0];
        index = 1;
      }

      for (var i = index; i < arr.length; i++) {
        initVal = fn.call(initVal, initVal, arr[i]);
      }

      return initVal;
    },

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
  /**
   * @method debounce
   * @param {fn, throshold, must}
   * @return {function}
   * @description fn是一个会被持续不断执行的函数，设置一个门槛
   */
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
  /**
   * @method throttle
   * @param {fn, threshold}
   * @return {function}
   * @description fn是一个会被持续不断执行的函数，设置一个门槛值threshold，只有当两次执行的间隔大于这个门槛时，真正的fn才会被执行
   * @weekness 如果一直触发，但是两次间隔一直小于门槛值，这是个问题，一直不会真正执行fn
   */
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

    // 原型继承
    function fn() {}
    fn.prototype = Father.prototype;
    Child.prototype = new fn(); // new Father() 同时会继承实例属性
    Child.prototype.constructor = Child;

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

  /**
   * @method customEvent
   * @param {obj} {object}
   * @return {obj}
   */
  function customEvent(obj) {
    var events = {};
    obj = obj || {};

    extend(obj, {
      on: function(type, handler) {
        events[type] = events[type] || [];
        events[type].push(handler);
      },
      off: function(type, handler) {
        if (!type) {
          events = {};
          return;
        }

        var list = events[type];
        if (typeof handler === 'function') {
          for (var i = 0; i < list.length; i++) {
            if (list[i] == handler) {
              list.splice(i, 1);
              i--;
            }
          }
        } else {
          events[type] = [];
        }
      },
      fire: function(type) {
        var list = events[type] || [];
        var args = Array.prototype.slice.call(arguments, 1);

        for (var i = 0; i < list.length; i++) {
          list[i].apply(null, args);
        }
      }
    });

    obj.bind = obj.add = obj.on;
    obj.unbind = obj.remove = obj.off;
    obj.trigger = obj.fire;

    return obj;
  }

  util.extend({
    customEvent: customEvent
  });


  // 自定义事件
  util.customEvent = function(obj) {
    obj = isPlainObject(obj) ? obj : {};
    extend(obj, new CustomEvent());
    return obj
  }

  function CustomEvent(obj) {
    this.events = {};
    this.context = obj || null;
  }

  CustomEvent.prototype = {
    constructor: CustomEvent,
    on: function(type, handler) {
      this.events[type] = this.events[type] || [];
      if (this.events[type].indexOf(handler) > -1) return false;
      this.events[type].push(handler);
    },
    off: function(type, handler) {
      var events = this.events[type],
        index;
      if (!handler) {
        this.events[type] = [];
      } else {
        index = events.indexOf(handler);
        if (index > -1) {
          events.splice(i, 1);
        }
      }
    },
    fire: function(type, param) {
      var events = this.events[type],
        i, len;
      extend(true, {
        type: type,
        context: this.context
      }, param || {});
      for (i = 0, len = events.length; i < len; i++) {
        events[i].call(this.context, param);
      }
    }
  };

  function createEvent(obj) {
    var events = {};

    extend(obj, {
      on: function(evtType, handler) {
        events[evtType] = events[evtType] || [];
        if (events[evtType].indexOf(handler) > -1) {
          return;
        }
        events[evtType].push(handler);
        return true;
      },
      off: function(evtType, handler) {
        events[evtType] = events[evtType] || [];
        if (handler) {
          var idx = events[evtType].indexOf(handler);
          if (idx < 0) {
            return false;
          }
          events[evtType].splice(idx, 1);
        } else {
          events[evtType] = [];
        }
        return true;
      },
      fire: function(evtType, args) {
        args = args || {};
        extend(args, {
          type: evtType,
          target: obj,
          preventDefault: function() {
            args.returnValue = false;
          },
          isPreventDefault: function() {
            return args.returnValue === false;
          }
        });
        var handlers = events[evtType] || [];
        for (var i = 0; i < handlers.length; i++) {
          if (args.isPreventDefault()) {
            break;
          }
        }
        return args.returnValue !== false
      }
    });

    obj.trigger = obj.fire;
    obj.remove = obj.off;
    obj.bind = obj.on;
    return obj;
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

  function setQueryString(key, value) {
    if (!key || typeof str !== 'string' || typeof key !== 'string') return null;
    key = encodeURIComponent(key);
    value = encodeURIComponent(value);
    var reg = new RegExp('(?|&)' + key + '=([^&=#]*)'),
      search = window.location.search,
      result;
    if (search) {
      result = search.match(reg);
      if (result) {
        search = search.replace(reg, function(all, $1, $2) {
          return $1 + key + '=' + value;
        });
      } else {
        search = search + "&" + key + "=" + value;
      }
    } else {
      search = '?' + key + "=" + value;
    }
    window.location.search = search;
  }

  // todo: 数组和对象
  function jsonToStr(obj, separator, connector) {
    separator = separator || "&";
    connector = connector || "=";
    var ret = [];
    for (var key in obj) {
      if (obj[key] == null) continue;
      if (obj.hasOwnProperty(key)) {
          if (obj[key] instanceof Array) {
            ret.push(encodeURIComponent(key) + '[]' + connector + encodeURIComponent(obj[key]));
          } else {
            ret.push(encodeURIComponent(key) + connector + encodeURIComponent(obj[key]));
          }
      }
    }
    return ret.join(separator)
  }

  function encodeURIJson(json) {
    return jsonToStr(json, '&', '=')
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

  /**
   * 反转义字符
   */
  function _unescape(s) {
    return s
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, "\"")
      .replace(/&#039;/g, "'")
      .replace(/&#39;/g, "'");
  };

  /**
   * 转义字符
   */
  function _escape(s) {
    if (!s) return s;
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/'/g, '&#39;');
  };

  /**
   * '&nbsp;' 转为 ' '
   * 相当于 _util.unescape 的功能
   */
  var stripTags = (function() {
    var stripTagDiv = document.createElement('div');

    return function(str) {
      stripTagDiv.innerHTML = str;
      return stripTagDiv.textContent || stripTagDiv.innerText;
    }
  })();

  // 轮询condition
  // success: 再max次内，并且condition返回true
  // error: condition返回false，condition执行有错误，超时
  function poll(condition, interval, max, success, error) {
    var times = 0;
    interval = interval || 300;
    max = max || Infinity;

    function execute() {
      var ret = condition();
      if (ret === true) {
        success();
      } else if (ret === false) {
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

  function getScrollTop() {
    return document.body.scrollTop || document.documentElement.scrollTop;
  }

  function getScrollLeft() {
    // document.documentElement for ie
    return document.body.scrollLeft || document.documentElement.scrollLeft;
  }

  function getBoundingClientRect(elem) {
    /*
     * @method getBoundingClientRect 获取元素相对于视窗的位置集合
     * ie5以上都能支持，但是又一点点地方需要修正一下;
     * IE6 7下浏览器存在2px的边框，包含在dist中，需要减去，并且没有width、height属性
     * @return Object {left, top, right, bottom} 有可能为负值
     * @description 获取元素四边(border顶, 不包括margin)与浏览器四边之间的距离
     * @description bottom - top = elem.heigth + elem.paddingTop + elem.paddingBottom + elem.borderTop + elem.borderBottom;
     */
    var rect = elem.getBoundingClientRect(),
      clientLeft = document.documentElement.clientLeft || 0,
      clientTop = document.documentElement.clientTop || 0;

    return {
      top: rect.top - clientTop,
      bottom: rect.bottom - clientTop,
      left: rect.left - clientLeft,
      right: rect.right - clientLeft,
      heigth: rect.bottom - rect.top,
      width: rect.right - rect.left
    }
  }

  /**
   * @method getOffset 获取元素相对于文档的位置集合
   * @param elem 
   * @return Object {left, top, right, bottom} 
   */
  function getOffset(elem) {
    var rect = getBoundingClientRect(elem),
      _scrollTop = getScrollTop(),
      _scrollLeft = getScrollLeft();

    return {
      top: rect.top + _scrollTop,
      bottom: rect.bottom + _scrollTop,
      left: rect.left + _scrollLef,
      right: rect.right + _scrollLeft
    }
  }

  // 在可视区底部边界内
  function inBottomfold(elem, threshold) {
    threshold = threshold || 0;
    var offset = getOffset(elem),
      windowHeight = window.innerHeight,
      scrollTop = getScrollTop(),
      fold = scrollTop + windowHeight;
    return fold + threshold >= offset.top;
  }

  // 在可视区顶部边界内
  function inTopfold(elem, threshold) {
    threshold = threshold || 0;
    var offset = getOffset(elem),
      scrollTop = getScrollTop(),
      fold = scrollTop;
    return fold <= offset.bottom + threshold
  }

  // 在可视区右边界内
  function inRightfold(element, threshold) {
    threshold = threshold || 0;
    var offset = getOffset(element),
      windowWidth = window.innerWidth,
      scrollLeft = getScrollLeft(),
      fold = windowWidth + scrollLeft;
    return fold + threshold >= offset.left;
  }

  // 在可视区左边界内
  function inLeftflod(element, threshold) {
    threshold = threshold || 0;
    var offset = getOffset(element),
      scrollLeft = getScrollLeft(),
      fold = scrollLeft;
    return fold <= offset.right + threshold;
  }

  function inView(elem, settings) {
    settings = settings || {};
    return inBottomfold(elem, settings.bottom || 0) && inTopfold(elem, settings.top || 0);
  }

  // script
  function loadScript(url, options) {
    options = options || {};

    var head = document.head || document.getElementsByTag('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;

    if (script.readyState) {
      script.onreadystatechange = function() {
        if (script.readyState === 'complete' || script.readyState === 'loaded') {
          options.success();
          head.removeChild(script);
        }
      }
    } else {
      script.onload = function() {
        options.success();
        head.removeChild(script);
      }
    }

    script.url = options.url;

    document.head.appendChild(script);
  }

  jsonp.default = {
    cache: true,
    async: true,
    timeout: 10000, // 10秒钟
    jsonp: 'callback',
  }

  // jsonp
  function jsonp(url, options) {
    if (isPlainObject(url)) {
      return jsonp(options.url, options)
    }
    options = isPlainObject(options) ? options : {};
    extend(true, jsonp.default, options);

    var _time = +new Date();
    var jsonpValue = 'jsonp' + _time;
    var _jsonpValue = windowp[jsonpValue];
    window[jsonpValue] = function(data, error) {
      head.removeChild(script);
      window[jsonpValue] = _jsonpValue;

      if (error) {
        options.error && options.error(error);
      } else {
        options.success && options.success(data);
      }
    }

    var queryData = options.data || {},
      searchStr = '';

    if (isPlainObject(queryData)) {
      for (var key in queryData) {
        if (queryData.hasOwnProperty(key)) {
          searchStr += encodeURIComponent(key) + '=' + encodeURIComponent(queryData[key]) + '&';
        }
      }
    } else if (typeof queryData === 'string') {
      searchStr = queryData
    }

    if (options.cache) {
      searchStr += "_=" + _time + '&';
    }

    searchStr += options.jsonp + '=' + jsonpValue;

    var script = document.createElement('script');
    script.async = options.async ? true : false;
    script.type = 'text/javascript';
    script.onerror = function(e) {
      window[jsonpValue](null, e);
    }

    if (options.timeout) {
      setTimeout(function() {
        window[jsonpValue](null, { type: 'timeout', status: 'error' });
      }, options.timeout)
    }

    script.url = url + (url.indexOf('?') > -1 ? searchStr : '?' + searchStr);
    var head = document.head || document.getElementsByTag('head')[0];
    head.appendChild(script);
  }

  return util;
});