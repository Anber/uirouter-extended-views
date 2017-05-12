(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', 'angular', '@uirouter/angularjs', 'js-md5', 'lodash.map', 'lodash.flatmap', 'lodash.mapvalues', 'lodash.compact'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('angular'), require('@uirouter/angularjs'), require('js-md5'), require('lodash.map'), require('lodash.flatmap'), require('lodash.mapvalues'), require('lodash.compact'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.angular, global.angularjs, global.jsMd5, global.lodash, global.lodash, global.lodash, global.lodash);
        global.index = mod.exports;
    }
})(this, function (exports, _angular, _angularjs, _jsMd, _lodash, _lodash3, _lodash5, _lodash7) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _angular2 = _interopRequireDefault(_angular);

    var _angularjs2 = _interopRequireDefault(_angularjs);

    var _jsMd2 = _interopRequireDefault(_jsMd);

    var _lodash2 = _interopRequireDefault(_lodash);

    var _lodash4 = _interopRequireDefault(_lodash3);

    var _lodash6 = _interopRequireDefault(_lodash5);

    var _lodash8 = _interopRequireDefault(_lodash7);

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

    var _slicedToArray = function () {
        function sliceIterator(arr, i) {
            var _arr = [];
            var _n = true;
            var _d = false;
            var _e = undefined;

            try {
                for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                    _arr.push(_s.value);

                    if (i && _arr.length === i) break;
                }
            } catch (err) {
                _d = true;
                _e = err;
            } finally {
                try {
                    if (!_n && _i["return"]) _i["return"]();
                } finally {
                    if (_d) throw _e;
                }
            }

            return _arr;
        }

        return function (arr, i) {
            if (Array.isArray(arr)) {
                return arr;
            } else if (Symbol.iterator in Object(arr)) {
                return sliceIterator(arr, i);
            } else {
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            }
        };
    }();

    function _objectWithoutProperties(obj, keys) {
        var target = {};

        for (var i in obj) {
            if (keys.indexOf(i) >= 0) continue;
            if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
            target[i] = obj[i];
        }

        return target;
    }

    function _toConsumableArray(arr) {
        if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

            return arr2;
        } else {
            return Array.from(arr);
        }
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

    var MODULE_NAME = 'extendedViews';
    var _module = _angular2.default.module(MODULE_NAME, [_angularjs2.default]);

    function getFullViewName(_ref) {
        var _ref$viewDecl = _ref.viewDecl,
            stateName = _ref$viewDecl.$uiViewContextAnchor,
            viewName = _ref$viewDecl.$name;

        return viewName.indexOf('@') >= 0 ? viewName : viewName + '@' + stateName;
    }

    function getFullToken(viewName, origToken) {
        var sync = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        var viewHash = (0, _jsMd2.default)(viewName);
        return origToken + '$' + viewHash + (sync ? '$sync' : '');
    }

    var styles = null;
    var sizeCache = null;

    _module.provider('$extendedViews', function () {
        var provider = {
            setStyles: function setStyles(value) {
                styles = value;
                return provider;
            },
            setSizeCache: function setSizeCache(value) {
                sizeCache = value;
                return provider;
            }
        };

        return _extends({
            $get: function $get() {
                return provider;
            }
        }, provider);
    });

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
                if (styles && styles.loading) {
                    $element[state ? 'addClass' : 'removeClass'](styles.loading);
                }

                if (sizeCache) {
                    $element.height(state && $cfg ? sizeCache.get($cfg.viewDecl) : 'auto');
                }
            };

            if (deps.length) {
                $scope.$watchGroup(deps.map(function (token) {
                    return '$parent.$resolve.' + getFullToken($cfg.viewDecl.$name, token);
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

    UiViewController.$inject = ['$element', '$scope', '$q'];

    _module.directive('uiView', ['$transitions', '$log', function ($transitions, $log) {
        var views = {};

        var add = function add(name, onStart, onFinish) {
            if (!views[name]) {
                views[name] = {
                    lastState: null,
                    callbacks: []
                };
            }

            var callbacks = {
                onStart: onStart,
                onFinish: onFinish
            };

            views[name].callbacks.push(callbacks);

            var lastState = views[name].lastState;
            if (lastState) {
                views[name].callbacks.forEach(function (cbs) {
                    return cbs[lastState]();
                });
            }

            return function () {
                views[name].callbacks = views[name].callbacks.filter(function (i) {
                    return i !== callbacks;
                });
            };
        };

        var applyState = function applyState(name, state) {
            if (views[name]) {
                views[name].callbacks.forEach(function (cbs) {
                    return cbs[state]();
                });
                views[name].lastState = state;
            } else {
                views[name] = {
                    lastState: state,
                    callbacks: []
                };
            }
        };

        var start = function start(name) {
            return applyState(name, 'onStart');
        };
        var finish = function finish(name) {
            return applyState(name, 'onFinish');
        };

        $transitions.onStart({}, function (trans) {
            var _trans$treeChanges = trans.treeChanges(),
                entering = _trans$treeChanges.entering,
                exiting = _trans$treeChanges.exiting,
                retained = _trans$treeChanges.retained;

            var touchedViews = [].concat(_toConsumableArray(entering), _toConsumableArray(exiting), _toConsumableArray(retained)).reduce(function (acc, path) {
                return [].concat(_toConsumableArray(acc), _toConsumableArray(path.views || []));
            }, []).map(getFullViewName);

            var distinctView = new Set(touchedViews);
            distinctView.forEach(start);
            trans.promise.finally(function () {
                return distinctView.forEach(finish);
            }).catch(function (err) {
                return err.type !== _angularjs.RejectType.SUPERSEDED && $log.warn(err);
            }); // eslint-disable-line no-console
        });

        return {
            restrict: 'ECA',
            priority: -1000,
            scope: {
                track: '<'
            },
            controller: UiViewController,
            compile: function compile() {
                return function (scope, $element, attr) {
                    var _$element$data2 = $element.data('$uiView'),
                        $cfg = _$element$data2.$cfg;

                    if (!$cfg) {
                        return;
                    }

                    var loadingMessage = attr.loadingMessage || $element.inheritedData('loadingMessage');
                    if (loadingMessage) {
                        $element.data('loadingMessage', loadingMessage);
                        attr.$set('loadingMessage', loadingMessage);
                    }

                    var fullName = getFullViewName($cfg);
                    attr.$set('full-view-name', fullName);
                    if (styles && styles.view) {
                        $element.addClass(styles.view);
                    }

                    var removeWatcher = add(fullName, function () {
                        return styles && styles.loading && $element.addClass(styles.loading);
                    }, function () {
                        return styles && styles.loading && $element.removeClass(styles.loading);
                    });

                    var saveSize = function saveSize() {
                        if (sizeCache) {
                            sizeCache.set($cfg.viewDecl, $element.height());
                        }
                    };

                    scope.$on('$destroy', removeWatcher);
                    scope.$on('$destroy', saveSize);
                };
            }
        };
    }]);

    _module.config(['$stateProvider', '$provide', function ($stateProvider, $provide) {
        function prepare(_ref2) {
            var name = _ref2.name,
                resolvable = _ref2.resolvable;

            var policy = resolvable.policy || {};
            return new _angularjs.Resolvable(getFullToken(name, resolvable.token), resolvable.resolveFn, resolvable.deps, _extends({}, policy, { async: 'NOWAIT' }), resolvable.data);
        }

        $stateProvider.decorator('resolvables', function (state, parent) {
            var resolves = (0, _lodash8.default)((0, _lodash4.default)(state.views, function (v) {
                return (v.resolve || []).map(function (r) {
                    return { name: v.$name, resolvable: r };
                });
            }));
            var resolvables = parent(state);
            if (resolves.length === 0) return resolvables;

            return [].concat(_toConsumableArray(resolvables), _toConsumableArray(resolves.map(function (view) {
                return prepare(view);
            })));
        });

        var ng1ViewConfigFactory = (0, _angularjs.getNg1ViewConfigFactory)();
        $provide.decorator('uiViewDirective', ['$delegate', '$q', function ($delegate, $q) {
            function wrap(_ref3) {
                var _compile = _ref3.compile,
                    directive = _objectWithoutProperties(_ref3, ['compile']);

                return _extends({}, directive, {
                    compile: function compile() {
                        var linkFn = _compile.apply(undefined, arguments);

                        return function (scope, $element, attr) {
                            var data = $element.data('$uiView');
                            var $cfg = data.$cfg,
                                $uiView = data.$uiView;

                            if (!$cfg) {
                                linkFn(scope, $element, attr);
                                return;
                            }

                            var _$cfg$viewDecl = $cfg.viewDecl,
                                resolve = _$cfg$viewDecl.resolve,
                                $name = _$cfg$viewDecl.$name;

                            if (!resolve || resolve.length === 0) {
                                linkFn(scope, $element, attr);
                                return;
                            }

                            var resolveCtx = $cfg.path && new _angularjs.ResolveContext($cfg.path);
                            var locals = resolveCtx && (0, _angularjs.getLocals)(resolveCtx);

                            $q.all(resolve.map(function (r) {
                                return locals[getFullToken($name, r.token)];
                            })).then(function (values) {
                                var _ng1ViewConfigFactory = ng1ViewConfigFactory([].concat(_toConsumableArray($cfg.path), [{
                                    state: {},
                                    resolvables: resolve.map(function (r, idx) {
                                        return _angularjs.Resolvable.fromData('' + getFullToken($name, r.token, true), values[idx]);
                                    })
                                }]), $cfg.viewDecl),
                                    _ng1ViewConfigFactory2 = _slicedToArray(_ng1ViewConfigFactory, 1),
                                    newCfg = _ng1ViewConfigFactory2[0];

                                newCfg.component = $cfg.component;
                                $element.data('$uiView', { $cfg: newCfg, $uiView: $uiView });
                                scope.$applyAsync(function ($scope) {
                                    return linkFn($scope, $element, attr);
                                });
                            });
                        };
                    }
                });
            }

            // eslint-disable-next-line angular/no-private-call
            return $delegate.map(function (d) {
                return d.$$moduleName === 'ui.router.state' ? wrap(d) : d;
            });
        }]);

        $stateProvider.decorator('views', function (state, parent) {
            function wrap(_ref4) {
                var resolve = _ref4.resolve,
                    view = _objectWithoutProperties(_ref4, ['resolve']);

                return _extends({}, view, {
                    resolve: resolve,
                    bindings: (resolve || []).reduce(function (acc, r) {
                        return _extends({}, acc, _defineProperty({}, r.token, '' + getFullToken(view.$name, r.token, true)));
                    }, {})
                });
            }

            return (0, _lodash6.default)(parent(state), function (v) {
                return v.resolve && v.component ? wrap(v) : v;
            });
        });
    }]);

    exports.default = MODULE_NAME;
});