(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.uiViewErrorHandler = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = uiViewErrorHandlerProvider;
    function uiViewErrorHandlerProvider() {
        var handlers = [];

        function service($log) {
            return function (stage, err) {
                var handler = void 0;
                var data = err;
                var queue = [].concat(handlers);
                while (data && (handler = queue.shift())) {
                    data = handler(stage, err);
                }

                if (data) {
                    $log.error(stage, data);
                }
            };
        }

        service.$inject = ['$log'];

        this.$get = service;

        this.addHandler = function (fn) {
            handlers.push(fn);
        };
    }

    uiViewErrorHandlerProvider.$inject = [];
});