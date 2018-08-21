(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '@uirouter/core', './ui-view-spinner', './content-cache'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('@uirouter/core'), require('./ui-view-spinner'), require('./content-cache'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.core, global.uiViewSpinner, global.contentCache);
        global.uiViewController = mod.exports;
    }
})(this, function (exports, _core, _uiViewSpinner, _contentCache) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _uiViewSpinner2 = _interopRequireDefault(_uiViewSpinner);

    var _contentCache2 = _interopRequireDefault(_contentCache);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

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

    var UiViewController = function () {
        function UiViewController($animate, $state, $element, $scope, $q) {
            _classCallCheck(this, UiViewController);

            this.onDestroyCallbacks = [];

            $animate.enabled($element, false);

            this.$state = $state;
            this.$element = $element;

            var spinner = _uiViewSpinner2.default.attachTo($element);

            var _$element$data = $element.data('$uiView'),
                $cfg = _$element$data.$cfg;

            this.deps = $cfg && $cfg.viewDecl.resolve || [];

            if ($cfg) {
                $element.html(_contentCache2.default.get($cfg.viewDecl) || undefined);
            }

            this.$scope = $scope;

            if (this.deps.length) {
                var resolveCtx = $cfg.path && new _core.ResolveContext($cfg.path);
                $scope.$watchGroup(this.deps.map(function (token) {
                    return function () {
                        return resolveCtx.getResolvable(token).get(resolveCtx);
                    };
                }), function (promises) {
                    spinner.show();

                    if (!(0, _core.any)(function (p) {
                        return p !== undefined;
                    })(promises)) {
                        return;
                    }

                    $q.all(promises).finally(function () {
                        return spinner.hide();
                    });
                });
            }
        }

        _createClass(UiViewController, [{
            key: '$onDestroy',
            value: function $onDestroy() {
                var $uiView = this.$element.data('$uiView');
                if (!$uiView || !$uiView.$cfg) return;

                var $cfg = $uiView.$cfg;
                var $element = this.$element;

                var trans = this.$state.transition;
                if (trans) {
                    var entering = trans.entering();
                    var exiting = trans.exiting().filter(function (node) {
                        return entering.indexOf(node) === -1;
                    });
                    if (exiting.indexOf($cfg.viewDecl.$context.self) !== -1) {
                        _contentCache2.default.delete($cfg.viewDecl);
                    } else {
                        _contentCache2.default.set($cfg.viewDecl, $element.html());
                    }
                }

                this.onDestroyCallbacks.forEach(function (fn) {
                    return fn();
                });
            }
        }, {
            key: 'onDestroy',
            value: function onDestroy(fn) {
                this.onDestroyCallbacks.push(fn);
            }
        }]);

        return UiViewController;
    }();

    exports.default = UiViewController;


    UiViewController.$inject = ['$animate', '$state', '$element', '$scope', '$q'];
});