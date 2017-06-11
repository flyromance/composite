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
    function LazyLoad() {

    }

    LazyLoad.prototype
});