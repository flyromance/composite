(function (global, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(global);
    } else if (typeof define === 'function' && define.amd) {
        define(function () {
            return factory(global);
        });
    } else {
        global.LazyLoad = factory(global);
    }
})(this, function (global) {

    function LazyLoad(conf, context) {
        this.initialize(context);
    }

    LazyLoad.prototype.initialize = function (conf, context) {
        if (!context || context.nodeType != 1 || context.nodeType != 9) {
            return this;
        }

        this.context = context;
        this.conf = util.extend(true, {}, conf);
        this.check();
    };

    LazyLoad.prototype.check = function () {
        var that = this;

        var elems = context.querySelectorAll('[' +  that.conf.attr + '~=' + that.conf.name +']');
        elems = util.filter(function (item, index) {
            if (!elem.getAttribute('data-lazyloaded')) return true;
        });
        var elem;

        for (var i = 0, lens; i < lens; i++) {
            elem = elems[i];
            if (util.inVerticalView(elem, that.conf.threshold)) {
                elem.setAttribute('data-lazyloaded', 'ok');
                elem.setAttribute('src', elem.getAttribute('data-src'));
            }
        }
    };

    LazyLoad.default_config = {
        attr: 'class',
        name: 'lazy-img',
        threshold: {
            top: 0,
            bottom: 0
        },
        animation: null, // fade
        debunce: {
            must: 1000,
            interval: 200
        }
    }
});