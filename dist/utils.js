(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', 'js-md5', '@uirouter/angularjs'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('js-md5'), require('@uirouter/angularjs'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.jsMd5, global.angularjs);
        global.utils = mod.exports;
    }
})(this, function (exports, _jsMd, _angularjs) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.getFullToken = getFullToken;
    exports.getFullViewName = getFullViewName;
    exports.normalizeResolvables = normalizeResolvables;

    var _jsMd2 = _interopRequireDefault(_jsMd);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function getFullToken(viewName, origToken) {
        var sync = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        var viewHash = (0, _jsMd2.default)(viewName);
        return origToken + '$' + viewHash + (sync ? '$sync' : '');
    }

    function getFullViewName(_ref) {
        var _ref$viewDecl = _ref.viewDecl,
            stateName = _ref$viewDecl.$uiViewContextAnchor,
            viewName = _ref$viewDecl.$name;

        return viewName.indexOf('@') >= 0 ? viewName : viewName + '@' + stateName;
    }

    function normalizeResolvables() {
        var resolve = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        if ((0, _angularjs.isArray)(resolve)) return resolve;

        return Object.keys(resolve).reduce(function (array, token) {
            var r = resolve[token];
            var deps = _angularjs.$injector.annotate(r);
            var providerFn = (0, _angularjs.isArray)(r) ? (0, _angularjs.tail)(r) : r;
            var resolvable = new _angularjs.Resolvable(token, providerFn, deps);

            return (0, _angularjs.pushR)(array, resolvable);
        }, []);
    }
});