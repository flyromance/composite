


(function () {
    var util = {};
    var slice = Array.prototype.slice,
        toString = Object.prototype.toString;
    

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



    window.util = util;
})();




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