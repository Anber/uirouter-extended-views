(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './resolvables', './views', './ui-view-directive'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./resolvables'), require('./views'), require('./ui-view-directive'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.resolvables, global.views, global.uiViewDirective);
        global.index = mod.exports;
    }
})(this, function (exports, _resolvables, _views, _uiViewDirective) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = config;

    var _resolvables2 = _interopRequireDefault(_resolvables);

    var _views2 = _interopRequireDefault(_views);

    var _uiViewDirective2 = _interopRequireDefault(_uiViewDirective);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function config($stateProvider, $provide) {
        $stateProvider.decorator('resolvables', _resolvables2.default);
        $stateProvider.decorator('views', _views2.default);
        $provide.decorator('uiViewDirective', _uiViewDirective2.default);
    }

    config.$inject = ['$stateProvider', '$provide'];
});