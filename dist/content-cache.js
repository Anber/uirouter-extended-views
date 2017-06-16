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
        global.contentCache = mod.exports;
    }
})(this, function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var cacheObj = {};
    exports.default = {
        get: function get(view) {
            return cacheObj[view.$name];
        },
        delete: function _delete(view) {
            delete cacheObj[view.$name];
        },
        set: function set(view, value) {
            cacheObj[view.$name] = value;
        }
    };
});