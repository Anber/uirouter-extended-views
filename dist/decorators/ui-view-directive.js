(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '@uirouter/angularjs'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('@uirouter/angularjs'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.angularjs);
        global.uiViewDirective = mod.exports;
    }
})(this, function (exports, _angularjs) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = uiViewDirective;

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

    function _objectWithoutProperties(obj, keys) {
        var target = {};

        for (var i in obj) {
            if (keys.indexOf(i) >= 0) continue;
            if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
            target[i] = obj[i];
        }

        return target;
    }

    var ng1ViewConfigFactory = (0, _angularjs.getNg1ViewConfigFactory)();

    function uiViewDirective($delegate, $q) {
        function wrap(_ref) {
            var _compile = _ref.compile,
                directive = _objectWithoutProperties(_ref, ['compile']);

            return _extends({}, directive, {
                compile: function compile() {
                    var linkFn = _compile.apply(undefined, arguments);

                    return function (scope, $element, attr) {
                        var data = $element.data('$uiView');
                        var $cfg = data.$cfg,
                            $uiView = data.$uiView;

                        if (!$cfg || !$cfg.viewDecl.resolve || !$cfg.viewDecl.resolve.length) {
                            linkFn(scope, $element, attr);
                            return;
                        }

                        var resolve = $cfg.viewDecl.resolve;

                        var resolveCtx = $cfg.path && new _angularjs.ResolveContext($cfg.path);
                        var getAsync = function getAsync(token) {
                            return resolveCtx && resolveCtx.getResolvable(token).get(resolveCtx);
                        };
                        $q.all(resolve.map(function (r) {
                            return getAsync(r);
                        })).then(function (values) {
                            var _ng1ViewConfigFactory = ng1ViewConfigFactory([].concat(_toConsumableArray($cfg.path), [{
                                state: {},
                                resolvables: resolve.map(function (r, idx) {
                                    return _angularjs.Resolvable.fromData(r.token, values[idx]);
                                })
                            }]), $cfg.viewDecl),
                                _ng1ViewConfigFactory2 = _slicedToArray(_ng1ViewConfigFactory, 1),
                                newCfg = _ng1ViewConfigFactory2[0];

                            return newCfg.load();
                        }).then(function (newCfg) {
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
    }

    uiViewDirective.$inject = ['$delegate', '$q'];
});