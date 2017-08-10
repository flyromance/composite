(function() {



    window.ReduxMy = {
        // 创建store
        createStore: function(reducer, initialState) {
            var state = initialState;

            return {
                getState: function() {
                    return state;
                },
                dispatch: function(action) {
                    state = reducer.call(null, state, action);
                },
                subscribe: function () {

                },
                replaceReducer: function () {

                }
            }
        },

        // 
        compose: function() {
            var funcs = Array.prototype.slice.apply(arguments);
            var lens = funcs.length;

            if (lens == 0) {
                return function (arg) {
                	return arg;
                };
            }

            if (lens == 1) {
                return funcs[0]
            }

            return function(arg) {
            	var args = Array.prototype.slice.apply(arguments);
                // 不用[].reduce
                // var ret = arguments;
                // for (var i = 0; i < funcs.length; i++) {
                // 	ret = funcs[i].apply(null, ret);
                // }
                // return ret;

                // 使用[].reduce
                return funcs.reduceRight(function(composed, f) {
                    return f(composed);
                }, funcs[lens - 1].apply(null, args));
            }
        },

        // 
        combineReducers: function () {

        },

        //
        bindActionCreators: function () {

        },

        // 
        applyMiddleware: function () {

        }

    }
})();