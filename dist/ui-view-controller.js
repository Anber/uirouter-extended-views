(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', 'lodash.map', './utils', './extendedViews'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('lodash.map'), require('./utils'), require('./extendedViews'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.lodash, global.utils, global.extendedViews);
        global.uiViewController = mod.exports;
    }
})(this, function (exports, _lodash, _utils, _extendedViews) {
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
        function UiViewController($element, $scope, $q) {
            var _this = this;

            _classCallCheck(this, UiViewController);

            var _$element$data = $element.data('$uiView'),
                $cfg = _$element$data.$cfg;

            var deps = $cfg ? (0, _lodash2.default)($cfg.viewDecl.resolve, 'token') : [];

            this.$scope = $scope;
            this.wait = function (promises) {
                return $q.all(promises).then(_this.onLoad.bind(_this), _this.onError.bind(_this));
            };
            this.setLoadingState = function (state) {
                var styles = (0, _extendedViews.getStyles)();
                var sizeCache = (0, _extendedViews.getSizeCache)();
                if (styles && styles.loading) {
                    $element[state ? 'addClass' : 'removeClass'](styles.loading);
                }

                if (sizeCache) {
                    $element.height(state && $cfg ? sizeCache.get($cfg.viewDecl) : 'auto');
                }
            };

            if (deps.length) {
                $scope.$watchGroup(deps.map(function (token) {
                    return '$parent.$resolve.' + (0, _utils.getFullToken)($cfg.viewDecl.$name, token);
                }), this.onChange.bind(this));
            } else {
                $scope.$watch('track', this.onTrackChange.bind(this));
            }
        }

        _createClass(UiViewController, [{
            key: 'onChange',
            value: function onChange(promises) {
                this.setState('loading');
                if (promises.every(function (p) {
                    return p === undefined;
                })) {
                    return;
                }

                this.wait(promises);
            }
        }, {
            key: 'onTrackChange',
            value: function onTrackChange() {
                var track = this.$scope.track;

                if (track === undefined) {
                    return;
                }

                this.onChange(Array.isArray(track) ? track : [track]);
            }
        }, {
            key: 'onLoad',
            value: function onLoad() {
                this.setState('loaded');
            }
        }, {
            key: 'onError',
            value: function onError() {
                this.setState('error');
            }
        }, {
            key: 'setState',
            value: function setState(name) {
                if (name === 'loading') {
                    this.setLoadingState(true);
                } else {
                    this.setLoadingState(false);
                }
            }
        }]);

        return UiViewController;
    }();

    exports.default = UiViewController;


    UiViewController.$inject = ['$element', '$scope', '$q'];
});