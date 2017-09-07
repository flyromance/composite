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
        console.log(finalArgs);
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


