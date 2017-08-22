(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '@uirouter/core'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('@uirouter/core'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.core);
        global.utils = mod.exports;
    }
})(this, function (exports, _core) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.getFullViewName = getFullViewName;
    exports.normalizeResolvables = normalizeResolvables;
    function getFullViewName(_ref) {
        var _ref$viewDecl = _ref.viewDecl,
            stateName = _ref$viewDecl.$uiViewContextAnchor,
            viewName = _ref$viewDecl.$name;

        return viewName.indexOf('@') >= 0 ? viewName : viewName + '@' + stateName;
    }

    function normalizeResolvables() {
        var resolve = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        if ((0, _core.isArray)(resolve)) return resolve;

        return Object.keys(resolve).reduce(function (array, token) {
            var r = resolve[token];
            var deps = _core.$injector.annotate(r);
            var providerFn = (0, _core.isArray)(r) ? (0, _core.tail)(r) : r;
            var resolvable = new _core.Resolvable(token, providerFn, deps);

            return (0, _core.pushR)(array, resolvable);
        }, []);
    }
});