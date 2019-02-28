(function() {
    function createThunkMiddleware(extraArgument) {
        return (storeApi) => next => action => {
            if (typeof action === 'function') {
                return action(storeApi.dispatch, storeApi.getState, extraArgument);
            }

            return next(action);
        };
    }

    window.ReduxThunk = createThunkMiddleware();
    ReduxThunk.withExtraArgument = createThunkMiddleware;
})();