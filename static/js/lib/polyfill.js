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