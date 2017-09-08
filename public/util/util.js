/*
0、命名空间管理
1、对原生对象的扩展
  - 类型判断：isArray isFunction isArrayLike isPlainObject isObject isEmptyObject ...
  - 字符串：trim、转义escape、反转义unescape、计算长度getStrLen、截断truncStr
  - 数组扩展：indexOf、lastIndexOf、forEach、map、filter、some、every、reduce
  - 函数扩展：bind(curry)
对象属性(深)：extend、mixin、assign、clone、keys
2、类继承createClass
3、原生事件
4、自定义事件
5、节流、防抖
9、预传参curry
6、each方法、轮询poll、await
7、queryString、getSearchParam、encodeURIJson
8、cookie操作
9、判断一个元素是否在可视区
10、加载script
*/


(function () {
    var util = {};
    var slice = Array.prototype.slice,
        toString = Object.prototype.toString;

    util.namespace = function (obj, namespace, val) {
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

    /* type */
    function type(val) {
        // [object String]
        return Object.prototype.toString.apply(val).slice(8, -1).toLowerCase();
    }

    function isArray(val) {
        return Array.isArray ? Array.isArray(val) : getType(val);
    }

    function isPlainObject(val) {
        return getType(val) === 'object';
    }

    function isEmptyObject(obj) {
        for (var key in obj) {
            return false;
        }
        return true;
    }

    function isObject(val) {
        return !!val && typeof val == 'object';
    }

    function isFunction(val) {
        return typeof val === 'function';
    }

    function extend() {
        var args = [].slice.apply(arguments);
        var isDeep, lens, target, sources, source,
            key, i, _target, _source, typeIsArray;

        if (typeof args[0] === 'boolean') {
            isDeep = args.shift();
        }
        lens = args.length;

        if (lens == 0) {
            return {};
        } else if (lens.length == 1) {
            target = this;
            sources = args;
        } else {
            target = args[0];
            sources = args.slice(1);
        }

        for (i = 0; i < sources.length; i++) {
            source = sources[0];
            if (source && typeof source === 'object') {
                for (key in source) {
                    _target = target[key];
                    _source = source[key];
                    if (deep && (typeIsArray = isArray(target)) || isPlainObject(target)) {
                        if (typeIsArray) {
                            target[key] = extend(deep, isArray(_target) ? _target : [], _source);
                        } else {
                            target[key] = extend(deep, isPlainObject(_target) ? _target : {}, _source);
                        }
                    } else if (typeof _source !== 'undefined') {
                        target[key] = _source;
                    }
                }
            }
        }

        return target;
    }

    util.extend = extend;

    util.extend({
        type: type,
        isArray: isArray,
        isFunction: isFunction,
        isPlainObject: isPlainObject,
        isObject: isObject
    });

    util.extend({
        // Array.prototype.indexOf
        indexOf: function (arr, val, index) {
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
        lastIndexOf: function (arr, val, index) {
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
        forEach: function (arr, fn) {
            for (var i = 0; i < arr.length; i++) {
                if (false === fn.call(arr[i], arr[i], i)) {
                    break;
                }
            }
        },
        map: function (arr, fn) {
            var ret = [];
            for (var i = 0; i < arr.length; i++) {
                arr.push(fn.call(arr[i], arr[i], i));
            }
            return ret;
        },
        filter: function (arr, fn) {
            var ret = [],
                result;
            for (var i = 0; i < arr.length; i++) {
                if (true === fn.call(arr[i], arr[i], i)) {
                    arr.push(arr[i]);
                }

            }
            return ret;
        },
        reduce: function (arr, fn, initVal) {
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

        // Function.prototype.bind
        bind: function (fn, context) {
            var args = Array.prototype.slice.call(arguments, 2);

            return function () {
                var _args = Array.prototype.slice.call(arguments);
                fn.apply(context, args.concat(_args));
            }
        },

        // Object.keys
        keys: function (obj) {
            var ret = [];
            for (var key in obj) {
                ret.push(key);
            }
            return ret;
        },

        // Object.assign({}, {})
        assign: function (target) {
            var sources = [].slice(arguments, 1);
            target = target || {};
            return extend.apply(null, [true, target].concat(sources));
        }
    });

    /**
     * @method throttle
     * @param {fn, threshold}
     * @return {function}
     * @description fn是一个会被持续不断执行的函数，设置一个门槛值threshold，只有当两次执行的间隔大于这个门槛时，真正的fn才会被执行
     * @weekness 如果一直触发，但是两次间隔一直小于门槛值，这是个问题，一直不会真正执行fn
     */
    var throttle = function (fn, threshold) {
        var timer = null;
        threshold = threshold || 200;

        return function () {
            var args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(null, args);
            }, threshold);
        }
    };

    /**
     * @method debounce
     * @param {fn, throshold, must}
     * @return {function}
     * @description fn是一个会被持续不断执行的函数，设置一个门槛
     */
    function debounce(fn, threshold, must) {
        var start_time = null,
            timer = null;
        must = must || 1000;
        threshold = threshold || 200;

        return function () {
            var args = arguments;

            start_time = start_time || +new Date(); // 第一次执行这个函数时，start_time为null
            var current_time = +new Date(); // 每次执行都要重新赋值

            if (current_time - start_time >= must) {
                fn.apply(null, args);
                start_time = current_time;
                return;
            }

            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(null, args);
            }, threshold);
        }
    }

    util.extend({
        throttle: throttle,
        debounce: debounce
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
            on: function (type, handler) {
                events[type] = events[type] || [];
                events[type].push(handler);
            },
            off: function (type, handler) {
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
            fire: function (type) {
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

    /* querystring */
    var querystring = {
        parse: function (str, divide, eq) {
            str = str || loaction.search;
            divide = divide || '&';
            eq = eq || '='
            var arr = str.split(divide),
                item, key, val,
                ret = {};
            for (var i = 0, lens = arr.length; i < lens; i++) {
                item = arr[i].split(eq);
                key = decodeURIComponent(item[0]);
                val = decodeURIComponent(item[1]);
                if (key) {
                    if (key in ret) {
                        ret[key] = isArray(ret[key]) ? ret[key] : [ret[key]];
                        ret[key].push(val);
                    } else {
                        ret[key] = val;
                    }
                }
            }

            return ret;
        },
        stringify: function (obj, divide, eq) {
            divide = divide || '&';
            eq = eq || '=';
            var arr = [];
            for (var key in obj) {
                arr.push(encodeURIComponent(key) + eq + encodeURIComponent(obj[key]));
            }
            return arr.join(divide);
        },
        get: function (str, key, separator, eq) {
            if (arguments.length < 2) throw new Error('arguments.length should gte 2');
            separator = separator || '&';
            eq = eq || '';
            var reg = new RegExp('(^|' + separator + ')' + key + eq + '([^' + separator + eq + ']*)');
            var match = reg.match(str);
            return match ? null : match[2];
        }
    }

    util.extend({
        querystring: querystring
    });


    /**
     * ##str.format(formatString, ...)##
     * @param {String} formatString
     * @return {String}
     *
     * ```javascript
     * //Simple
     * str.format('{0}',2014) //Error
     * str.format('{0}',[2014])
     * => 2014
     *
     * str.format('{2}/{1}/{0}',[2014,6,3])
     * => "3/6/2014"
     *
     * str.format('{2}/{1}/{0}',2014,6,3)
     * => "3/6/2014"
     *
     * str.format("{year}-{month}-{date}",{year:2014,month:6,date:3})
     * => "2014-6-3"
     *
     * //Advanced
     * str.format('{2,2,0}/{1,2,0}/{0}',[2014,6,3]);
     * => "03/06/2014"
     *
     * str.format('{2,2,!}/{1,2,*}/{0}',[2014,6,3]);
     * => "!3/*6/2014"
     *
     * str.format("{year}-{month,2,0}-{date,2,0}",{year:2014,month:6,date:3})
     * => "2014-06-03"
     *
     * str.format('{0,-5}',222014)
     * => "22014"
     *
     * format('{0,6,-}{1,3,-}','bar','')
     * => "---bar---"
     * ```
     */
    var format = (function () {
        function postprocess(ret, a) {
            var align = parseInt(a.align),
                absAlign = Math.abs(a.align),
                result, retStr;

            if (ret == null) {
                retStr = '';
            } else if (typeof ret == 'number') {
                retStr = '' + ret;
            } else {
                throw new Error('Invalid argument type!');
            }

            if (absAlign === 0) {
                return ret;
            } else if (absAlign < retStr.length) {
                result = align > 0 ? retStr.slice(0, absAlign) : retStr.slice(-absAlign);
            } else {
                result = Array(absAlign - retStr.length + 1).join(a.pad || format.DefaultPaddingChar);
                result = align > 0 ? result + retStr : retStr + result;
            }
            return result;
        }

        function p(all) {
            var ret = {},
                p1, p2, sep = format.DefaultFieldSeperator;
            p1 = all.indexOf(sep);
            if (p1 < 0) {
                ret.index = all;
            } else {
                ret.index = all.substr(0, p1);
                p2 = all.indexOf(sep, p1 + 1);
                if (p2 < 0) {
                    ret.align = all.substring(p1 + 1, all.length);
                } else {
                    ret.align = all.substring(p1 + 1, p2);
                    ret.pad = all.substring(p2 + 1, all.length);
                }
            }
            return ret; //{index,pad,align}
        }

        return function (self, args) {
            var len = arguments.length;
            if (len > 2) {
                args = Array.prototype.slice.call(arguments, 1);
            } else if (len === 2 && !isPlainObject(args)) {
                args = [args];
            } else if (len === 1) {
                return self;
            }
            return self.replace(format.InterpolationPattern, function (all, m) {
                var a = p(m),
                    ret = tryget(args, a.index);
                if (ret == null) ret = a.index;
                return a.align == null && a.pad == null ? ret : postprocess(ret, a) || ret;
            });
        };
    })();

    format.DefaultPaddingChar = ' ';
    format.DefaultFieldSeperator = ',';
    format.InterpolationPattern = /\{(.*?)\}/g;

    function formatDate(ts, opts) {
        opts = opts || {};
        var tmp = String(ts),
            t, eff = tmp.match(/000$/) ? 1 : 1000;

        if (tmp.match(/^[\d]+$/)) {
            t = new Date(parseInt(ts * eff, 10));
        } else /* if (tmp.match(/\d+-\d+-\d+( \d+:\d+:\d+)?/))*/ {
            t = new Date(Date.parse(tmp.replace(/-/g, '/')));
        }
        return format(opts.format || utils.formatDate.DateFormatShort, {
            year: t.getFullYear(),
            month: t.getMonth() + 1,
            date: t.getDate(),
            hour: t.getHours(),
            min: t.getMinutes()
        });
    }

    formatDate.DateFormatShort = "{month,2,0}-{date,2,0} {hour,2,0}:{min,2,0}";

    function normalizeDateTime(s) {
        if (!s) return null;
        var d;
        s = s.toString();
        if (s.match(/^\d{10}$/)) {
            d = new Date(parseInt(s, 10) * 1000);
        } else if (s.match(/^\d{10,}$/)) {
            d = new Date(parseInt(s, 10));
        } else if (s.indexOf('-') > 0) {
            d = new Date(Date.parse(s.replace(/-/g, '/')));
        }
        return d;
    }

    /**
     * 将"2014-01-01 12:12:12"格式化成 "1月1日 12:12" 或 " 2014年1月1日 12:12"
     */
    function chsdate(s, year) {
        var d = normalizeDateTime(s),
            result;
        if (!d) return null;

        result = format('{month}月{date}日 {hour}:{minute,2,0}', {
            month: d.getMonth() + 1,
            date: d.getDate(),
            hour: d.getHours(),
            minute: d.getMinutes()
        });
        return year ? d.getFullYear() + '年' + result : result;
    }

    function elapse(s) {
        var d = normalizeDateTime(s);
        if (!d) return null;

        var now = new Date(),
            delta = Math.floor((now - d) / 1000);

        if (delta <= 60) {
            return '刚刚';
        } else if (delta > 60 && delta < 3600) {
            return Math.floor(delta / 60) + '分钟前';
        } else if (delta >= 3600 && delta < 864e2) {
            return Math.floor(delta / 3600) + '小时前'
        } else if (delta >= 864e2 && delta < 864e2 * 3) { // 最多显示 2天前
            return Math.floor(delta / 864e2) + '天前';
        } else if (delta >= 864e2 * 3) {
            var now = new Date(),
                formatStr = '{month,2,0}月{date,2,0}日';
            if (now.getFullYear() !== d.getFullYear()) { // 如果不是今年
                formatStr = '{year}年{month,2,0}月{date,2,0}日';
            }
            return format(formatStr, {
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                date: d.getDate()
            });
        }
    }

    /**
     * 将数字转换为1k,1w的形式
     */
    function toKw(n) {
        if (n < 1000) return n;
        if (n < 10000 && n >= 1000) return (n / 1000).toFixed(0) + 'K';
        return (n / 10000).toFixed(0) + 'W';
    };

    /**
     * 将1k,1w转化为对应的数字
     * @param  {[type]} s [description]
     * @return {[type]}   [description]
     */
    function fromKw(s) {
        var units = {
                k: 1000,
                w: 10000
            },
            v = s.toLowerCase().replace(/([\d.]+)(k|w)$/, function (all, n, u) {
                return parseInt(n, 10) * (units[u] || 1);
            });
        return parseInt(v, 10);
    };

    /* 字符 */
    function countStr(str, setlen) {
        var str = $.trim(str);
        var count = 0,
            re = /[\u4e00-\u9fa5]/,
            uFF61 = parseInt("FF61", 16),
            uFF9F = parseInt("FF9F", 16),
            uFFE8 = parseInt("FFE8", 16),
            uFFEE = parseInt("FFEE", 16);

        for (var i = 0, len = str.length; i < len; i++) {
            if (re.test(str[i])) {
                count += 1;
            } else {
                var c = parseInt(str.charCodeAt(i));
                if (c < 256) {
                    count += 0.5
                } else {
                    if ((uFF61 <= c) && (c <= uFF9F)) {
                        count += 0.5;
                    } else if ((uFFE8 <= c) && (c <= uFFEE)) {
                        count += 0.5;
                    } else {
                        count += 1;
                    }
                }
            }
        }
        return count;
    }

    function cutStr(str, lens) {
        lens = typeof lens === 'number' ? lens : str.length;
        return str.length > lens ? str.subStr(0, lens) + '...' : str;
    }

    /**
     * @method escapeStr
     * @param {string}
     * @return {string}
     * @description 
     */
    function escapeToHtml(str) {
        str.replace(/(><\/)/g, function (all, $1) {
            return htmlMap[$1];
        });
    }

    function unescapeToStr(str) {

    }

    function unescape(s) {
        return s
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, "\"")
            .replace(/&#039;/g, "'")
            .replace(/&#39;/g, "'");
    }

    function escape(s) {
        if (!s) {
            return s
        }
        return s
            .replace(/&/g, '&amp')
            .replace(/</g, '&lt')
            .replace(/>/g, '&gt')
            .replace(/\"/g, '&quot')
            .replace(/'/g, '&#039')
            .replace(/'/g, '&#39');
    }


    /**
     * set: 
     */
    var cookie = {
        get: function (key) {
            var reg = new RegExp('(^|\\s)' + encodeURIComponent(key) + '=([^=;\\s]*)');
            var match = document.cookie.match(reg);
            return match ? match[2] ? match[2] : null : null;
        },
        set: function (key, value, option) {
            option = option || {};
            var expires = option.expires;
            var _expires = null;
            if (expires instanceof Date) {
                _expires = expires;
            } else if (typeof expires == 'number') {
                _expires = new Date(new Date().getTime() + expires);
            } else if (typeof expires == 'string') {
                var timeType = expires.slice(expires.length - 1).toLowerCase();
                var time = expires.slice(0, expires.length - 1);
                switch (timeType) {
                    case 'y':
                        _expires = new Date(new Date().getTime() + time * 365 * 24 * 60 * 60 * 1000);
                        break;
                    case 'm':
                        _expires = new Date(new Date().getTime() + time * 30 * 24 * 60 * 60 * 1000);
                        break;
                    case 'h':
                        _expires = new Date(new Date().getTime() + time * 60 * 60 * 1000);
                        break;
                    case 'd':
                    default:
                        _expires = new Date(new Date().getTime() + time * 24 * 60 * 60 * 1000);
                        break;
                }
            }

            document.cookie = encodeURIComponent(key) + '=' + encodeURIComponent(value) + ';' +
                (option.path ? 'path=' + option.path + ';' : '') +
                (option.domain ? 'domain=' + option.domain + ';' : '') +
                (_expires ? 'expires=' + _expires.toGMTString() + ';' : '') +
                (option.secure ? 'secure' + ';' : '');
        },
        remove: function (key) {
            cookie.set(key, '', {
                expires: -10
            });
        }
    }

    util.extend({
        cookie: cookie
    });

    /**
     * @method getoffset
     * @param dom
     * @return Object {left, top, right, bottom} 只有可能为负值
     * @description 获取元素四边(border顶, 不包括margin)与浏览器四边之间的距离
     * @description ie下浏览器存在2px的边框，包含在dist中，需要减去
     * @description bottom - top = elem.heigth + elem.paddingTop + elem.paddingBottom + elem.borderTop + elem.borderBottom;
     */
    function getOffset(elem) {

        var toClientDist = elem.getBoundingClientRect(),
            clientLeft = document.documentElement.clientLeft,
            clientTop = document.documentElement.clientTop;

        return {
            top: toClientDist.top - clientTop,
            bottom: toClientDis.bottom - clientTop,
            left: toClientDist.left - clientLeft,
            right: toClientDist.right - clientLeft
        }
    }

    util.extend({
        getOffset: getOffset
    });

    /**
     * inview 
     * 
     */
    function inView(elem, threshold) {

    }

    function inVerticalView(elem, threshold) {
        if (!elem || elem.nodeType !== 1) {
            throw new Error('param error, should be dom');
        }

        return inVerticalAboveView(elem, threshold.top) && inVerticalBelowView(elem, threshold.bottom);
    }

    function inHorizontalView(elem, threshold) {

    }

    function inVerticalAboveView(elem, threshold) {
        if (!elem || elem.nodeType !== 1) {
            throw new Error('param error, should be dom');
        }
        threshold = +threshold || 0;

        // 滚动条滚动距离
        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

        // 元素顶部(border上边缘)与浏览器顶部距离
        var topToTop = getOffset(elem).top;
        return scrollTop + threshold >= topToTop;
    }

    function inVerticalBelowView(elem, threshold) {
        if (!elem || elem.nodeType !== 1) {
            throw new Error('param error, should be dom');
        }
        threshold = +threshold || 0;
        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

        // 元素底部(border下边缘)与浏览器顶部距离
        var bottomToTop = getOffset(elem).bottom;
        return scrollTop - threshold <= bottomToTop;
    }

    util.extend({
        inView: {
            inVerticalView: inVerticalView
        }
    });

    window.util = util;
})();


/**
 *
 */

var _util = {};
var _array_ = [];
var slice = _array_.slice;
var hasOwn = _util.hasOwnProperty;

_util.type = function (value) {
    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
};

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

/**
 * 是否为空对象
 * @param: Object
 * @return: Boolean
 */
function isEmptyObject(obj) {
    for (var key in obj) {
        return false;
    }

    return true;
}

/**
 * 是否为数组
 * @param: Object
 * @return: Boolean
 */
function isArray(arr) {
    if (typeof arr !== 'object') {
        return false;
    } else if (typeof Array.isArray === 'function') {
        return Array.isArray(arr);
    } else {
        // return arr instanceof Array;
        // return arr.constructor.prototype.hasOwnProperty('slice');
        return _util.type(arr) === 'array';
    }
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

/**
 * 循环
 */
function each(input, handler) {
    for (var i = 0; i < input.length; i++) {
        if (typeof handler === 'function' && handler.apply(input[i], i, input[i], input) === false) {
            break;
        }
    }
}

/**
 * pollfill indexOf
 */
(function (isSupported) {
    if (!isSupported) {
        Array.prototype.indexOf = function (item, index) {
            for (var i = index || 0; i < this.length; i++) {
                if (item === this[i]) {
                    return i
                }
            }

            return -1;
        }
    }
})(!!Array.prototype.indexOf);

(function (isSupported) {
    if (!isSupported) {
        Array.prototype.forEach = function (handler) {
            each(this, handler);
        }
    }
})(!!Array.prototype.forEach);

//
['String', 'Number', 'Boolean', 'Array', 'Function', 'Object', 'Window', 'Null'].forEach(function (item, index) {
    util['is' + item] = function (value) {
        return util.type(value) === item.toLowerCase();
    };
});


/**
 * 浅层扩展
 * @param: map不传：target上没有key才会覆盖
 * @param: map为true，都覆盖
 */
function mixin(target, source, map) {

    // target上没有key, 或者target上的key不存在
    map = map || function (t, s, key) {
            if (!(target[key] || (key in target))) {
                return s;
            }
            return t;
        };

    if (map === true) { // override
        map = function (t, s) {
            return s;
        }
    }

    for (var key in source) {
        target[key] = map(target[key], source[key], key);
        if (target[key] === undefined) {
            delete target[key];
        }
    }

    return target;
}

/**
 * @param:
 * @notice: 支持深度扩展
 */
function extend() {
    var args = toArray(arguments);
    var deep = false,
        i = 0, target, sources, source, lens, key, clone, copy, typeIsArray;

    // 第一个参数为布尔值
    if (typeof args[0] === 'boolean') {
        deep = args.shift();
    }
    target = args[0];

    // 如果不是对象，直接返回
    if (typeof target != 'object') {
        return target;
    }

    sources = args.slice(1); // 获取扩展对象
    lens = sources.length;
    while (i < lens) {

        if ((source = sources[i]) != null) { // 排除null 或者 undefined
            for (key in source) {
                copy = source[key];

                if (isPureObject(copy) || (typeIsArray = isArray(copy))) {
                    if (typeIsArray) {
                        clone = isArray(source[key]) ? source[key] : [];
                        typeIsArray = false;
                    } else {
                        clone = isPureObject(source[key]) ? source[key] : {};
                    }
                    target[key] = extend(target[key], source[key]);
                } else if (copy !== undefined) {
                    target[key] = source[key];
                }
            }
        }

        i++;
    }

    return target;
}

/**
 * clone
 * @notice: 函数不能用JSON.stringify, 要用toString()
 */
function cloneByJSON(source) {
    if (typeof source != 'object') return source;
    return JSON.parse(JSON.stringify(source));
}

/**
 * clone
 * */
function clone(obj, deep) {
    if (typeof source != 'object') return obj;
    var ret = null;

    if (obj instanceof Array) {
        ret = [];
        for (var i = 0; i < obj.length; i++) {
            if (deep === true) {
                ret[i] = clone(obj[i], deep);
            } else {
                ret[i] = obj[i];
            }
        }
    } else {
        ret = {};
        for (var key in obj) {
            if (deep === true) {
                ret[key] = clone(obj[key], deep);
            } else {
                ret[key] = obj[key];
            }
        }
    }

    return ret;
}


// 函数柯里化: 预先传参
function curry(fn, params) {
    var initArgs = toArray(arguments, 1);
    return function () {
        var innerArgs = toArray(arguments);
        var finalArgs = initArgs.concat(innerArgs);
        fn.apply(null, finalArgs);
    }
}

(function () {
    Function.prototype.curry = function () {
        var that = this;
        var initArgs = toArray(arguments);
        return function () {
            var innerArgs = toArray(arguments);
            that.apply(null, initArgs.concat(innerArgs));
        };
    }
})();

// 绑定上下文
function bind(fn, context) {
    return function () {
        return fn.apply(context, arguments);
    }
}

// bind this，模拟原生bind
// 自定义bind方法，使用之后，无法再用原生的方法更改this了;
(function (isSupported) {
    if (!isSupported) {
        Function.prototype.bind = function () {
            var args = toArray(arguments);
            var that = this;
            // var context = args[0],
            //     params = args.slice(1);
            // return function () {
            //     var _args = toArray(arguments);
            //     that.apply(context, params.concat(_args));
            // }
            return bind(that, args[0]);
        };
    }
})(!!Function.prototype.bind);


// 函数绑定和柯里化结合
function bindCurry(fn, context) {
    var initArgs = Array.prototype.slice.call(arguments, 2);
    return function () {
        var innerArgs = Array.prototype.slice.call(arguments);
        var finalArgs = initArgs.concat(innerArgs);
        fn.apply(context, finalArgs);
    }
}

// json数据序列化为字符串
_util.jsonToString = function (json, separator) {
    var s = [];
    for (var p in json) {
        if (json[p] == null) continue;
        if (json[p] instanceof Array) {
            for (var i = 0; i < json[p].length; i++) {
                s.push(encodeURIComponent(p) + '[]=' + encodeURIComponent(json[p][i]))
            }
        } else {
            s.push(encodeURIComponent(p) + '=' + encodeURIComponent(json[p]));
        }
    }
    return s.join(separator || '&');
};


// 字符串转为json数据
_util.stringToJson = function (str, delimiter) {
    var _item = [],
        _key = '',
        _value = '',
        ret = {},
        _arr = str && str.split(delimiter || '&');
    for (var i = 0, _lens = _arr.length; i < _lens; i++) {
        _item = _arr[i].split('=');
        _key = decodeURIComponent(_item[0]);
        _value = decodeURIComponent(_item[1]);
        ret[_key] = _value;
    }
    return ret;
};



// search param相关
// www.baidu.com/news/?name=xxx&age=12#ccc
_util.queryUrl = {
    get: function (key) {
        if (typeof key !== 'string') return;
        var reg = new RegExp('(?&)' + encodeURIComponent(key) + '=([^=#&]*)'),
            result = window.location.search.match(reg);
        return result && result[1] && decodeURIComponent(result[2]);
    },
    set: function (key, value) {
        if (typeof key !== 'string' || typeof value !== 'string') return;
        key = encodeURIComponent(key);
        value = encodeURIComponent(value);
        var reg = new RegExp('(?|&)' + key + '=([^&=#]*)'),
            search = window.location.search,
            result;
        if (search) {
            result = search.match(reg);
            if (result) {
                search = search.replace(reg, function (all, $1, $2) {
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
};

// cookie参数：name value domain path expires secure
_util.cookie = {
    get: function (key) {
        var reg = new RegExp("(^| )" + key + "=([^;]*)(;|\x24)"),
            result = reg.exec(document.cookie),
            value = result ? result[2] : "";

        if (value && typeof value === 'string') {
            return decodeURIComponent(value);
        }

        return null;
    },
    _get: function (name) {
        var cookie = document.cookie;
        var initStartNum = cookie.indexOf(name);
        var startNum = initStartNum + name.length + 1;
        var endNum = cookie.indexOf(';', startNum);
        if (endNum == -1) {
            endNum = cookie.length;
        }
        return cookie.substring(startNum, endNum);
    },
    set: function (key, value, options) {
        options = options || {};
        var expires = options.expires;
        if (typeof options.expires === 'number') {
            expires = new Date();
            expires.setTime(expires.getTime() + options.expires);
        }

        document.cookie =
            encodeURIComponent(key) + "=" + encodeURIComponent(value)
            + (options.path ? "; path=" + options.path : "")
            + (expires ? "; expires=" + expires.toGMTString() : "")
            + (options.domain ? "; domain=" + options.domain : "")
            + (options.secure ? "; secure" : '');
    },
    remove: function (key, options) {
        options = options || {};
        options.expires = new Date(0);
        this.setRaw(key, '', options);
    }
};

// 设为首页
_util.setHome = function (obj, url) {
    try {
        obj.style.behavior = 'url(#default#homepage)';
        obj.setHomePage(url);
    } catch (e) {
        if (window.netscape) {
            try {
                window.netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            } catch (e) {
                alert("抱歉，此操作被浏览器拒绝！\n\n请在浏览器地址栏输入“about:config”并回车然后将[signed.applets.codebase_principal_support]设置为'true'");
            }
        } else {
            alert("抱歉，您所使用的浏览器无法完成此操作。\n\n您需要手动将【" + url + "】设置为首页。");
        }
    }
};

// 收藏本页
_util.addFavorite = function (title, url) {
    try {
        window.external.addFavorite(url, title);
    } catch (e) {
        try {
            window.sidebar.addPanel(title, url, "");

        } catch (e) {
            alert("抱歉，您所使用的浏览器无法完成此操作。\n\n加入收藏失败，请进入新网站后使用Ctrl+D进行添加");
        }
    }
};


function compareVersion(a, b) {
    if (!a || !b) {
        throw '比较对象不正确！';
    }

    var a_arr = a.split('.'),
        b_arr = b.split('.'),
        a_lens = a_arr.length,
        b_lens = b_arr.length,
        a_match = null,
        b_match = null;

    var lens = a_lens > b_lens ? b_lens : a_lens;
    var a_item, b_item;

    for (var i = 0; i < lens; i++) {
        a_item = parseInt(a_arr[i]);
        b_item = parseInt(b_arr[i]);

        if (a_item > b_item) {
            return 1;
        } else if (a_item < b_item) {
            return -1;
        } else {
            a_match = (a_arr[i] + '').match(/^(\d*)(\D*)$/) || [];
            b_match = (b_arr[i] + '').match(/^(\d*)(\D*)$/) || [];

            if (a_match[2] || b_match[2]) {
                if (a_match[2] > b_match[2]) {
                    return 1;
                } else if (a_match[2] < b_match[2]) {
                    return -1;
                }
            }
        }
    }

    return a_lens > b_lens ? 1 : a_lens == b_lens ? 0 : -1;
}


// 函数节流: 指定时间间隔内只会执行一次任务
function throttle(fn, interval) {
    interval = interval || 300;
    var canRun = true;
    return function () {
        if (!canRun) return;
        var context = this,
            args = arguments;
        canRun = false;
        setTimeout(function () {
            fn.apply(this, arguments);
            canRun = true;
        }, interval);
    };
}

// 函数防抖: 任务频繁触发的情况下，只有任务触发的间隔超过指定间隔的时候，任务才会执行
function debounce(fn, interval) {
    interval = interval || 300;
    var timeout = null;
    return function () {
        var context = this,
            args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            fn.apply(this, arguments);
        }, interval);
    };
}

// 防抖结合节流
// delay的间隔内连续触发的调用，后一个调用会把前一个调用的等待处理掉，但每隔mustRunDelay至少执行一次
function debounceV2(fn, delay, mustRunDelay) {
    var timer = null;
    var t_start;
    return function () {
        var context = this,
            args = arguments,
            t_curr = +new Date();
        clearTimeout(timer);
        if (!t_start) {
            t_start = t_curr;
        }
        if (t_curr - t_start >= mustRunDelay) {
            fn.apply(context, args);
            t_start = t_curr;
        } else {
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        }
    };
}

/**
 * 自定义事件
 * */
(function () {
    function CustomEvent(obj) {
        this.events = {};
        this.context = obj || null;
    }

    CustomEvent.prototype = {
        constructor: CustomEvent,
        on: function (type, handler) {
            this.events[type] = this.events[type] || [];
            if (this.events[type].indexOf(handler) > -1) return false;
            this.events[type].push(handler);
        },
        off: function (type, handler) {
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
        fire: function (type, param) {
            var events = this.events[type], i, len;
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
            on: function (evtType, handler) {
                events[evtType] = events[evtType] || [];
                if (events[evtType].indexOf(handler) > -1) {
                    return;
                }
                events[evtType].push(handler);
                return true;
            },
            off: function (evtType, handler) {
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
            fire: function (evtType, args) {
                args = args || {};
                extend(args, {
                    type: evtType,
                    target: obj,
                    preventDefault: function () {
                        args.returnValue = false;
                    },
                    isPreventDefault: function () {
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

    function handleMessage(message) {
        console.log('hello' + ":" + message);
    }

    var target = new CustomEvent();
    target.on('message', handleMessage);

    target.fire('message', 'fanlong2046');
    target.off('message', handleMessage);
})();


/**
 * 反转义字符
 */
_util.unescape = function unescape(s) {
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
_util.escape = function (s) {
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
var stripTags = (function () {
    var stripTagDiv = document.createElement('div');

    return function (str) {
        stripTagDiv.innerHTML = str;
        return stripTagDiv.textContent || stripTagDiv.innerText;
    }
})();

/**
 * 计算字符串的长度，并且超过一定长度
 *
 */
function getStrLen(str) {
    var count = 0,
        re = /[\u4e00-\u9fa5]/,
        uFF61 = parseInt("FF61", 16),
        uFF9F = parseInt("FF9F", 16),
        uFFE8 = parseInt("FFE8", 16),
        uFFEE = parseInt("FFEE", 16);
    for (var i = 0, len = str.length; i < len; i++) {
        if (re.test(str[i])) {
            count += 1;
        } else {
            var c = parseInt(str.charCodeAt(i));
            if (c < 256) {
                count += 0.5
            } else {
                if ((uFF61 <= c) && (c <= uFF9F)) {
                    count += 0.5;
                } else if ((uFFE8 <= c) && (c <= uFFEE)) {
                    count += 0.5;
                } else {
                    count += 1;
                }
            }
        }
    }
    return count;
}

/**
 * 截取一定长度的字符串
 * @relay: getStrLen
 */
function cutStr(str, len) {
    if (!str || typeof str !== 'string') return '';
    var count = getStrLen(str);
    len = len || str.length;
    if (count >= len) {
        return (str.substr(0, (len - 2)) + '...');
    }
    return str;
}

/**
 * 截取一定长度的字符串
 */
function truncStr(str, max, suffix, isStripTags) {
    if (!str) return str;
    if (isStripTags) {
        str = utils.stripTags(str);
    }
    var i = 0,
        len = str.length,
        ch, result = '',
        c = 0;
    if (len < max / 2) return str;
    for (; i < len && c < max; ++i) {
        ch = str.charAt(i);
        result += ch;
        c += !!ch.match(/[ 。 ；  ， ： “ ”（ ） 、 ？ 《 》\u4E00-\u9FA5]/) ? 2 : 1
    }
    return result + (suffix || '');
}

/**
 * 轮询执行某个task，直到task返回false或者超过轮询最大次数上限
 * 如果成功超过轮询上限，执行complete，否则执行abort
 * @param task 轮询的任务
 * @param step 轮询间隔，以毫秒为单位
 * @param max 最大轮询次数
 * @param complete 超过最大次数，轮询成功
 * @param abort task返回false，轮询被中断
 */
_util.poll = function (task, step, max, complete, abort) {
    step = step || 100;
    if (max == null) max = Infinity;
    if (max <= 0) {
        complete && complete();
        return;
    }

    if (task() !== false) {
        setTimeout(function () {
            qboot.poll(task, step, max - 1, complete, abort);
        }, step);
    } else {
        abort && abort();
    }
};

/**
 * 等待直到cond条件为true执行success
 * 如果等待次数超过max，则执行failer
 * @param cond await条件，返回true则执行success，否则继续等待，直到超过等待次数max，执行failer
 * @param success await成功
 * @param failer await失败
 * @param step 时间间隔
 * @param max 最大次数
 */
_util.await = function (cond, success, failer, step, max) {
    qboot.poll(function () {
        if (cond()) {
            success();
            return false;
        }
        return true;
    }, step, max, failer);
};

function await(cond, success, failer, step, max) {
    step = step || 300;
    max = max || Infinity;
    if (max <= 0) {
        if (cond()) {
            success();
        } else {
            failer();
        }
        return;
    }

    if (cond()) {
        success();
    } else if (cond() === false) {
        failer();
    } else {
        setTimeout(function () {
            await(cond, success, fail, step, max - 1);
        }, step)
    }
}

_util.loadScript = function(opt) {
    var script = document.createElement('script');
    script.async = true;
    script.type = 'text/javascript';
    script.src = opt.url;
    var head = document.getElementsByTagName('head')[0];
    head.insertBefore(script, document.getElementsByTagName('script')[0]);
};

/**
 * jsonp
 * */
_util.jsonp = (function() {
    var defalut_opt = {
        timeout: 30000,
        jsonp: 'callback'
    };
    var count = 0;

    var jsonpRet = function(url, data, callback, opt) {
        if (typeof data !== 'object') {
            opt = callback, callback = data, data = null;
        }

        if (data) {
            url += (/\?/.test(url) ? "&" : "?") + _util.jsonToString(data);
        }

        opt = extend({}, defalut_opt, opt);

        // 自定义事件

        var jsonp_value = '__jsonp' + (count++) + '__';
        if (!window[jsonp_value]) {
            window[jsonp_value] = function(data, err) {
                if (err) {

                } else {
                    // 执行自定义事件

                    callback && callback(data);
                }

                // 防止内存泄漏
                window[jsonp_value] = null;
                delete window[jsonp_value];
            }
        }

        setTimeout(function() {
            window[jsonp_value](null, {status: 'error', reason: 'timeout'});
        }, opt.timeout);

        _util.loadScript({url: url});

        // 返回自定义
    };

    return jsonpRet;
})();

/* 某个节点是否在可视区
 */
function belowthefold(element, settings) {
    var fold, $window = $(window);
    fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
    return fold <= $(element).offset().top - settings.threshold;
}

function rightoffold(element, settings) {
    var fold, $window = $(window);
    fold = $window.width() + $window.scrollLeft();
    return fold <= $(element).offset().left - settings.threshold;
}

function abovethetop(element, settings) {
    var fold, $window = $(window);
    fold = $window.scrollTop();
    return fold >= $(element).offset().top + settings.threshold + $(element).height();
}

function leftofbegin(element, settings) {
    var fold, $window = $(window);
    fold = $window.scrollLeft();
    return fold >= $(element).offset().left + settings.threshold + $(element).width();
}

function inviewport(element, settings) {
    return !rightoffold(element, settings) && !leftofbegin(element, settings) &&
        !belowthefold(element, settings) && !abovethetop(element, settings);
}

_util.inVerticViewport = function () {
    
}

_util.inHorizontalViewport = function () {

}

_util.inviewport = inviewport;


