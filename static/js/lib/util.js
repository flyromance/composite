(function () {
    var util = {};
    var slice = Array.prototype.slice,
        toString = Object.prototype.toString;

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
            var ret = [], result;
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
            var now = new Date(), formatStr = '{month,2,0}月{date,2,0}日';
            if(now.getFullYear() !== d.getFullYear()) { // 如果不是今年
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
            v = s.toLowerCase().replace(/([\d.]+)(k|w)$/, function(all, n, u) {
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
