(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '@uirouter/core', '../utils'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('@uirouter/core'), require('../utils'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.core, global.utils);
        global.resolvables = mod.exports;
    }
})(this, function (exports, _core, _utils) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

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

    function prepare(resolvable) {
        var policy = resolvable.policy || {};
        return new _core.Resolvable(resolvable, function () {
            return resolvable.resolveFn.apply(resolvable, arguments);
        }, resolvable.deps, _extends({}, policy, { async: 'NOWAIT' }), resolvable.data);
    }

    exports.default = function (state, parent) {
        var allStateResolvables = (0, _core.flatten)(state.path.map(function (node) {
            return node.resolvables;
        })).filter(function (r) {
            return r;
        }).map(function (r) {
            return r.token;
        });

        var resolves = (0, _core.flatten)((0, _core.values)(state.views).map(function (v) {
            return (0, _utils.normalizeResolvables)(v.resolve);
        })).filter(function (r) {
            return r && allStateResolvables.indexOf(r) === -1;
        });

        var resolvables = parent(state);
        if (resolves.length === 0) return resolvables;

        var prepared = resolves.map(function (r) {
            return prepare(r);
        });
        return [].concat(_toConsumableArray(resolvables), _toConsumableArray(prepared));
    };
});