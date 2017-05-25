(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '@uirouter/angularjs', './ui-view-controller', './utils', './extendedViews'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('@uirouter/angularjs'), require('./ui-view-controller'), require('./utils'), require('./extendedViews'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.angularjs, global.uiViewController, global.utils, global.extendedViews);
        global.uiView = mod.exports;
    }
})(this, function (exports, _angularjs, _uiViewController, _utils, _extendedViews) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = uiView;

    var _uiViewController2 = _interopRequireDefault(_uiViewController);

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

    function uiView($transitions, $log) {
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
            }, []).map(_utils.getFullViewName);

            var distinctView = new Set(touchedViews);
            distinctView.forEach(start);
            trans.promise.finally(function () {
                return distinctView.forEach(finish);
            }).catch(function (err) {
                return err.type !== _angularjs.RejectType.SUPERSEDED && $log.warn(err);
            });
        });

        return {
            restrict: 'ECA',
            priority: -1000,
            scope: {
                track: '<'
            },
            controller: _uiViewController2.default,
            compile: function compile() {
                return function (scope, $element, attr) {
                    var styles = (0, _extendedViews.getStyles)();
                    var sizeCache = (0, _extendedViews.getSizeCache)();

                    var _$element$data = $element.data('$uiView'),
                        $cfg = _$element$data.$cfg;

                    if (!$cfg) {
                        return;
                    }

                    var loadingMessage = attr.loadingMessage || $element.inheritedData('loadingMessage');
                    if (loadingMessage) {
                        $element.data('loadingMessage', loadingMessage);
                        attr.$set('loadingMessage', loadingMessage);
                    }

                    var fullName = (0, _utils.getFullViewName)($cfg);
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
    }

    uiView.$inject = ['$transitions', '$log'];
});