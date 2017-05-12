import angular from 'angular';
import uiRouter, { RejectType, getNg1ViewConfigFactory, Resolvable, ResolveContext, getLocals } from '@uirouter/angularjs';
import md5 from 'js-md5';
import map from 'lodash.map';
import flatMap from 'lodash.flatmap';
import mapValues from 'lodash.mapvalues';
import compact from 'lodash.compact';

const MODULE_NAME = 'extendedViews';
const module = angular.module(MODULE_NAME, [uiRouter]);

function getFullViewName({ viewDecl: { $uiViewContextAnchor: stateName, $name: viewName } }) {
    return viewName.indexOf('@') >= 0 ? viewName : `${viewName}@${stateName}`;
}

function getFullToken(viewName, origToken, sync = false) {
    const viewHash = md5(viewName);
    return `${origToken}$${viewHash}${sync ? '$sync' : ''}`;
}

let styles = null;
let sizeCache = null;

module.provider('$extendedViews', () => {
    const provider = {
        setStyles(value) {
            styles = value;
            return provider;
        },
        setSizeCache(value) {
            sizeCache = value;
            return provider;
        },
    };

    return {
        $get: () => provider,
        ...provider,
    }
});

class UiViewController {
    constructor($element, $scope, $q) {
        const { $cfg } = $element.data('$uiView');
        const deps = $cfg ? map($cfg.viewDecl.resolve, 'token') : [];

        this.$scope = $scope;
        this.wait = promises => $q.all(promises).then(::this.onLoad, ::this.onError);
        this.setLoadingState = (state) => {
            if (styles && styles.loading) {
                $element[state ? 'addClass' : 'removeClass'](styles.loading);
            }

            if (sizeCache) {
                $element.height(state && $cfg ? sizeCache.get($cfg.viewDecl) : 'auto');
            }
        };

        if (deps.length) {
            $scope.$watchGroup(
                deps.map(token => `$parent.$resolve.${getFullToken($cfg.viewDecl.$name, token)}`),
                ::this.onChange,
            );
        } else {
            $scope.$watch('track', ::this.onTrackChange);
        }
    }

    onChange(promises) {
        this.setState('loading');
        if (promises.every(p => p === undefined)) {
            return;
        }

        this.wait(promises);
    }

    onTrackChange() {
        const { track } = this.$scope;
        if (track === undefined) {
            return;
        }

        this.onChange(Array.isArray(track) ? track : [track]);
    }

    onLoad() {
        this.setState('loaded');
    }

    onError() {
        this.setState('error');
    }

    setState(name) {
        if (name === 'loading') {
            this.setLoadingState(true);
        } else {
            this.setLoadingState(false);
        }
    }
}

UiViewController.$inject = ['$element', '$scope', '$q'];

module.directive('uiView', ['$transitions', '$log', ($transitions, $log) => {
    const views = {};

    const add = (name, onStart, onFinish) => {
        if (!views[name]) {
            views[name] = {
                lastState: null,
                callbacks: [],
            };
        }

        const callbacks = {
            onStart,
            onFinish,
        };

        views[name].callbacks.push(callbacks);

        const lastState = views[name].lastState;
        if (lastState) {
            views[name].callbacks.forEach(cbs => cbs[lastState]());
        }

        return () => {
            views[name].callbacks = views[name].callbacks.filter(i => i !== callbacks);
        };
    };

    const applyState = (name, state) => {
        if (views[name]) {
            views[name].callbacks.forEach(cbs => cbs[state]());
            views[name].lastState = state;
        } else {
            views[name] = {
                lastState: state,
                callbacks: [],
            };
        }
    };

    const start = name => applyState(name, 'onStart');
    const finish = name => applyState(name, 'onFinish');

    $transitions.onStart({}, (trans) => {
        const { entering, exiting, retained } = trans.treeChanges();
        const touchedViews = [...entering, ...exiting, ...retained]
            .reduce((acc, path) => [...acc, ...(path.views || [])], [])
            .map(getFullViewName);

        const distinctView = new Set(touchedViews);
        distinctView.forEach(start);
        trans.promise.finally(
            () => distinctView.forEach(finish),
        ).catch(err => err.type !== RejectType.SUPERSEDED && $log.warn(err)); // eslint-disable-line no-console
    });

    return {
        restrict: 'ECA',
        priority: -1000,
        scope: {
            track: '<',
        },
        controller: UiViewController,
        compile: () => (scope, $element, attr) => {
            const { $cfg } = $element.data('$uiView');
            if (!$cfg) {
                return;
            }

            const loadingMessage = attr.loadingMessage || $element.inheritedData('loadingMessage');
            if (loadingMessage) {
                $element.data('loadingMessage', loadingMessage);
                attr.$set('loadingMessage', loadingMessage);
            }

            const fullName = getFullViewName($cfg);
            attr.$set('full-view-name', fullName);
            if (styles && styles.view) {
                $element.addClass(styles.view);
            }

            const removeWatcher = add(
                fullName,
                () => styles && styles.loading && $element.addClass(styles.loading),
                () => styles && styles.loading && $element.removeClass(styles.loading),
            );

            const saveSize = () => {
                if (sizeCache) {
                    sizeCache.set($cfg.viewDecl, $element.height());
                }
            };

            scope.$on('$destroy', removeWatcher);
            scope.$on('$destroy', saveSize);
        },
    };
}]);

module.config(['$stateProvider', '$provide', ($stateProvider, $provide) => {
    function prepare({ name, resolvable }) {
        const policy = resolvable.policy || {};
        return new Resolvable(
            getFullToken(name, resolvable.token),
            resolvable.resolveFn,
            resolvable.deps,
            { ...policy, async: 'NOWAIT' },
            resolvable.data,
        );
    }

    $stateProvider.decorator('resolvables', (state, parent) => {
        const resolves = compact(flatMap(
            state.views,
            v => (v.resolve || []).map(r => ({ name: v.$name, resolvable: r })),
        ));
        const resolvables = parent(state);
        if (resolves.length === 0) return resolvables;

        return [
            ...resolvables,
            ...resolves.map(view => prepare(view)),
        ];
    });

    const ng1ViewConfigFactory = getNg1ViewConfigFactory();
    $provide.decorator('uiViewDirective', ['$delegate', '$q', ($delegate, $q) => {
        function wrap({ compile, ...directive }) {
            return {
                ...directive,
                compile(...compileArgs) {
                    const linkFn = compile(...compileArgs);

                    return (scope, $element, attr) => {
                        const data = $element.data('$uiView');
                        const { $cfg, $uiView } = data;
                        if (!$cfg) {
                            linkFn(scope, $element, attr);
                            return;
                        }

                        const { resolve, $name } = $cfg.viewDecl;
                        if (!resolve || resolve.length === 0) {
                            linkFn(scope, $element, attr);
                            return;
                        }

                        const resolveCtx = $cfg.path && new ResolveContext($cfg.path);
                        const locals = resolveCtx && getLocals(resolveCtx);

                        $q.all(resolve.map(r => locals[getFullToken($name, r.token)])).then((values) => {
                            const [newCfg] = ng1ViewConfigFactory([
                                ...$cfg.path,
                                {
                                    state: {},
                                    resolvables: resolve.map((r, idx) => Resolvable.fromData(
                                        `${getFullToken($name, r.token, true)}`,
                                        values[idx],
                                    )),
                                },
                            ], $cfg.viewDecl);
                            newCfg.component = $cfg.component;
                            $element.data('$uiView', { $cfg: newCfg, $uiView });
                            scope.$applyAsync($scope => linkFn($scope, $element, attr));
                        });
                    };
                },
            };
        }

        // eslint-disable-next-line angular/no-private-call
        return $delegate.map(d => (d.$$moduleName === 'ui.router.state' ? wrap(d) : d));
    }]);

    $stateProvider.decorator('views', (state, parent) => {
        function wrap({ resolve, ...view }) {
            return {
                ...view,
                resolve,
                bindings: (resolve || []).reduce((acc, r) => ({
                    ...acc,
                    [r.token]: `${getFullToken(view.$name, r.token, true)}`,
                }), {}),
            };
        }

        return mapValues(
            parent(state),
            v => (v.resolve && v.component ? wrap(v) : v),
        );
    });
}]);

export default MODULE_NAME;
