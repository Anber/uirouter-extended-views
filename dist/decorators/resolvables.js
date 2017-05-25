(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '@uirouter/angularjs', 'lodash.flatmap', 'lodash.compact', '../utils'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('@uirouter/angularjs'), require('lodash.flatmap'), require('lodash.compact'), require('../utils'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.angularjs, global.lodash, global.lodash, global.utils);
        global.resolvables = mod.exports;
    }
})(this, function (exports, _angularjs, _lodash, _lodash3, _utils) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _lodash2 = _interopRequireDefault(_lodash);

    var _lodash4 = _interopRequireDefault(_lodash3);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _toConsumableArray(arr) {
        if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
                arr2[i] = arr[i];
            }

            return arr2;
        } else {
            return Array.from(arr);
        }
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

    function prepare(_ref) {
        var name = _ref.name,
            resolvable = _ref.resolvable;

        var policy = resolvable.policy || {};
        return new _angularjs.Resolvable((0, _utils.getFullToken)(name, resolvable.token), resolvable.resolveFn, resolvable.deps, _extends({}, policy, { async: 'NOWAIT' }), resolvable.data);
    }

    exports.default = function (state, parent) {
        var resolves = (0, _lodash4.default)((0, _lodash2.default)(state.views, function (v) {
            return (v.resolve || []).map(function (r) {
                return { name: v.$name, resolvable: r };
            });
        }));
        var resolvables = parent(state);
        if (resolves.length === 0) return resolvables;

        return [].concat(_toConsumableArray(resolvables), _toConsumableArray(resolves.map(function (view) {
            return prepare(view);
        })));
    };
});