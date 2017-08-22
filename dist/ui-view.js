(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '@uirouter/core', './ui-view-controller', './utils', './extendedViews'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('@uirouter/core'), require('./ui-view-controller'), require('./utils'), require('./extendedViews'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.core, global.uiViewController, global.utils, global.extendedViews);
        global.uiView = mod.exports;
    }
})(this, function (exports, _core, _uiViewController, _utils, _extendedViews) {
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

    function getAllSyncTokens(state) {
        var tokens = state.resolvables.filter(function (r) {
            return !r.policy || r.policy.async !== 'NOWAIT';
        }).map(function (r) {
            return r.token;
        });
        if (!state.parent) {
            return tokens;
        }

        return tokens.concat(getAllSyncTokens(state.parent));
    }

    function getOrResolve(injector, token) {
        try {
            return injector.get(token);
        } catch (ex) {
            return injector.getAsync(token);
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
            var injector = trans.injector();
            var $q = injector.get('$q');

            var _trans$treeChanges = trans.treeChanges(),
                entering = _trans$treeChanges.entering,
                exiting = _trans$treeChanges.exiting,
                retained = _trans$treeChanges.retained;

            var touchedNodes = [].concat(_toConsumableArray(entering), _toConsumableArray(retained));
            var unresolved = touchedNodes.reduce(function (res, _ref) {
                var resolvables = _ref.resolvables;
                return res.concat(resolvables.filter(function (r) {
                    return !r.resolved;
                }));
            }, []).map(function (r) {
                return r.token;
            });

            touchedNodes.forEach(function (_ref2) {
                var state = _ref2.state,
                    views = _ref2.views;

                if (!views || !views.length) return;
                var allTokens = getAllSyncTokens(state);
                var tokensForResolve = unresolved.filter(function (token) {
                    return allTokens.indexOf(token) !== -1;
                });
                var promises = tokensForResolve.map(function (t) {
                    return getOrResolve(injector, t);
                });
                var touchedViews = views.map(function (view) {
                    var name = (0, _utils.getFullViewName)(view);
                    if (!view.viewDecl.resolve || !view.viewDecl.resolve.length) {
                        return {
                            name: name,
                            promises: promises
                        };
                    }

                    return {
                        name: name,
                        promises: promises.concat(view.viewDecl.resolve.map(function (r) {
                            return getOrResolve(injector, r);
                        }))
                    };
                });

                touchedViews.forEach(function (_ref3) {
                    var name = _ref3.name,
                        promises = _ref3.promises;

                    if (!promises || !promises.length) return;

                    start(name);
                    $q.all(promises).finally(function () {
                        return finish(name);
                    }).catch(function (err) {
                        return $log.warn(err);
                    });
                });
            });

            var distinctView = exiting.reduce(function (acc, path) {
                return [].concat(_toConsumableArray(acc), _toConsumableArray(path.views || []));
            }, []).map(_utils.getFullViewName).reduce(_core.uniqR, []);

            distinctView.forEach(start);
            trans.promise.finally(function () {
                return distinctView.forEach(finish);
            }).catch(function (err) {
                return err.type !== _core.RejectType.SUPERSEDED && $log.warn(err);
            });
        });

        return {
            restrict: 'ECA',
            priority: -1000,
            controller: _uiViewController2.default,
            compile: function compile() {
                return function (scope, $element, attr, $ctrl) {
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

                    var loadingClass = $element.attr('loading-class') || _extendedViews.defaultClasses.loading;
                    if (_extendedViews.defaultClasses.view) {
                        $element.addClass(_extendedViews.defaultClasses.view);
                    }

                    if (loadingClass) {
                        $ctrl.onDestroy(add(fullName, function () {
                            return $element.addClass(loadingClass);
                        }, function () {
                            return $element.removeClass(loadingClass);
                        }));
                    }
                };
            }
        };
    }

    uiView.$inject = ['$transitions', '$log'];
});