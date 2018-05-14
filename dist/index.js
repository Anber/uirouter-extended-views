(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', 'angular', '@uirouter/angularjs', './extendedViews', './ui-view', './ui-view-error-handler', './decorators'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('angular'), require('@uirouter/angularjs'), require('./extendedViews'), require('./ui-view'), require('./ui-view-error-handler'), require('./decorators'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.angular, global.angularjs, global.extendedViews, global.uiView, global.uiViewErrorHandler, global.decorators);
        global.index = mod.exports;
    }
})(this, function (exports, _angular, _angularjs, _extendedViews, _uiView, _uiViewErrorHandler, _decorators) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _angular2 = _interopRequireDefault(_angular);

    var _angularjs2 = _interopRequireDefault(_angularjs);

    var _extendedViews2 = _interopRequireDefault(_extendedViews);

    var _uiView2 = _interopRequireDefault(_uiView);

    var _uiViewErrorHandler2 = _interopRequireDefault(_uiViewErrorHandler);

    var _decorators2 = _interopRequireDefault(_decorators);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = _angular2.default.module('extendedViews', [_angularjs2.default]).provider('$extendedViews', _extendedViews2.default).provider('$uiViewErrorHandler', _uiViewErrorHandler2.default).directive('uiView', _uiView2.default).config(_decorators2.default).name;
});