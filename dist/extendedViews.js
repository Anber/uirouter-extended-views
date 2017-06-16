(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.extendedViews = mod.exports;
    }
})(this, function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _extends = Object.assign || function (target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];

            for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }

        return target;
    };

    var defaultClasses = exports.defaultClasses = {
        view: null,
        loading: null
    };

    exports.default = function () {
        var provider = {
            setDefaultClasses: function setDefaultClasses(value) {
                Object.assign(defaultClasses, value);
                return provider;
            }
        };

        return _extends({
            $get: function $get() {
                return provider;
            }
        }, provider);
    };
});