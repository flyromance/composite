(function () {
    var util = {};

    /* polyfill */
    if (typeof Array.prototype.indexOf !== 'function') {
        Array.prototype.indexOf = function (val, index) {
            index = typeof index === 'number' ? index : 0;

            if (index < 0) {
                index = this.length + index;
            } else if (index >= this.length) {
                index = this.length - 1;
            }

            for (var i = index; i < this.length; i++) {
                if (this[i] === val) {
                    return i;
                }
            }

            return -1;
        };
    }

    if (typeof Array.prototype.lastIndexOf !== 'function') {
        Array.prototype.lastIndexOf = function (val, index) {
            index = typeof index === 'number' ? index : this.length;

            if (index < 0) {
                index = this.length + index;
            } else if (index >= this.length) {
                index = this.length - 1;
            }

            for (var i = index; i >= 0; i--) {
                if (this[i] == val) {
                    return i;
                }
            }

            return -1;
        }
    }

    if (typeof Function.prototype.bind !== 'function') {
        Function.prototype.bind = function (context) {
            var args = [].slice.call(arguments, 1);
            var that = this;

            return function () {
                var _args = [].slice.call(arguments);
                that.apply(context, args.concat(_args));
            }
        }
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
            var arr = str.split(divide), item, key, val,
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

    /* 字符 */
    function getLength(str) {

    }

    function cut(str, lens) {
        return str.subStr(0, lens);
    }

    var htmlMap = {
        '<': '&lt;',
        '>': '&gt;',
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