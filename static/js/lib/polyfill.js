if (!window.console) {
    window.console = {
        log: function () {},
        dir: function () {},
        error: function () {},
        warn: function () {}
    };
}


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


if (!window.JSON) {
    window.JSON = {
        parse: function (sJSON) {
            return eval('(' + sJSON + ')');
        },
        stringify: (function () {
            var toString = Object.prototype.toString;
            var isArray = Array.isArray || function (a) {
                return toString.call(a) === '[object Array]';
            };
            var escMap = { '"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t' };
            var escFunc = function (m) {
                return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1);
            };
            var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
            return function stringify(value) {
                if (value == null) {
                    return 'null';
                } else if (typeof value === 'number') {
                    return isFinite(value) ? value.toString() : 'null';
                } else if (typeof value === 'boolean') {
                    return value.toString();
                } else if (typeof value === 'object') {
                    if (typeof value.toJSON === 'function') {
                        return stringify(value.toJSON());
                    } else if (isArray(value)) {
                        var res = '[';
                        for (var i = 0; i < value.length; i++)
                            res += (i ? ', ' : '') + stringify(value[i]);
                        return res + ']';
                    } else if (toString.call(value) === '[object Object]') {
                        var tmp = [];
                        for (var k in value) {
                            if (value.hasOwnProperty(k))
                                tmp.push(stringify(k) + ': ' + stringify(value[k]));
                        }
                        return '{' + tmp.join(', ') + '}';
                    }
                }
                return '"' + value.toString().replace(escRE, escFunc) + '"';
            };
        })()
    };
}
