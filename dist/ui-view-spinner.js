(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '@uirouter/core', './extendedViews'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('@uirouter/core'), require('./extendedViews'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.core, global.extendedViews);
        global.uiViewSpinner = mod.exports;
    }
})(this, function (exports, _core, _extendedViews) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var UiViewSpinner = function () {
        _createClass(UiViewSpinner, null, [{
            key: 'attachTo',
            value: function attachTo($element) {
                var instance = new UiViewSpinner($element);
                $element.data('$$uiViewSpinnerController', instance);

                return instance;
            }
        }]);

        function UiViewSpinner($element) {
            _classCallCheck(this, UiViewSpinner);

            this.show = _core.noop;
            this.hide = _core.noop;

            var loadingClass = $element.attr('loading-class') || _extendedViews.defaultClasses.loading;

            if (!loadingClass) return;

            this.show = function () {
                return $element.addClass(loadingClass);
            };
            this.hide = function () {
                return $element.removeClass(loadingClass);
            };
        }

        return UiViewSpinner;
    }();

    exports.default = UiViewSpinner;
});