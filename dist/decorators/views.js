(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', 'lodash.mapvalues', '../utils'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('lodash.mapvalues'), require('../utils'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.lodash, global.utils);
        global.views = mod.exports;
    }
})(this, function (exports, _lodash, _utils) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _lodash2 = _interopRequireDefault(_lodash);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _defineProperty(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
            });
        } else {
            obj[key] = value;
        }

        return obj;
    }

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

    function _objectWithoutProperties(obj, keys) {
        var target = {};

        for (var i in obj) {
            if (keys.indexOf(i) >= 0) continue;
            if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
            target[i] = obj[i];
        }

        return target;
    }

    exports.default = function (state, parent) {
        function wrap(_ref) {
            var resolve = _ref.resolve,
                view = _objectWithoutProperties(_ref, ['resolve']);

            var resolvables = (0, _utils.normalizeResolvables)(resolve);
            return _extends({}, view, {
                resolve: resolvables,
                bindings: resolvables.reduce(function (acc, r) {
                    return _extends({}, acc, _defineProperty({}, r.token, r.token));
                }, {})
            });
        }

        return (0, _lodash2.default)(parent(state), function (v) {
            return v.resolve && v.component ? wrap(v) : v;
        });
    };
});