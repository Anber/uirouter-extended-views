import { RejectType, uniqR } from '@uirouter/core';

import UiViewController  from './ui-view-controller';
import { getFullViewName } from './utils';
import { defaultClasses } from './extendedViews';

function getAllSyncTokens(state) {
    const tokens = state.resolvables.filter(r => !r.policy || r.policy.async !== 'NOWAIT').map(r => r.token);
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

export default function uiView($transitions, $log) {
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
        const injector = trans.injector();
        const $q = injector.get('$q');

        const { entering, exiting, retained } = trans.treeChanges();
        const touchedNodes = [...entering, ...retained];
        const unresolved = touchedNodes
            .reduce(
                (res, { resolvables }) => res.concat(resolvables.filter(r => !r.resolved)),
                [],
            )
            .map(r => r.token);

        touchedNodes.forEach(({ state, views }) => {
            if (!views || !views.length) return;
            const allTokens = getAllSyncTokens(state);
            const tokensForResolve = unresolved.filter(token => allTokens.indexOf(token) !== -1);
            const promises = tokensForResolve.map(t => getOrResolve(injector, t));
            const touchedViews = views.map((view) => {
                const name = getFullViewName(view);
                if (!view.viewDecl.resolve || !view.viewDecl.resolve.length) {
                    return {
                        name,
                        promises,
                    };
                }

                return {
                    name,
                    promises: promises.concat(view.viewDecl.resolve.map(r => getOrResolve(injector, r))),
                };
            });

            touchedViews.forEach(({ name, promises }) => {
                if (!promises || !promises.length) return;

                start(name);
                $q.all(promises)
                    .finally(() => finish(name))
                    .catch(err => $log.warn(err));
            });
        });


        const distinctView = exiting
            .reduce((acc, path) => [...acc, ...(path.views || [])], [])
            .map(getFullViewName)
            .reduce(uniqR, []);

        distinctView.forEach(start);
        trans.promise
            .finally(
                () => distinctView.forEach(finish),
            )
            .catch(err => err.type !== RejectType.SUPERSEDED && $log.warn(err));
    });

    return {
        restrict: 'ECA',
        priority: -1000,
        controller: UiViewController,
        compile: () => (scope, $element, attr, $ctrl) => {
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

            const loadingClass = $element.attr('loading-class') || defaultClasses.loading;
            if (defaultClasses.view) {
                $element.addClass(defaultClasses.view);
            }

            if (loadingClass) {
                $ctrl.onDestroy(add(
                    fullName,
                    () => $element.addClass(loadingClass),
                    () => $element.removeClass(loadingClass),
                ));
            }
        },
    };
}

uiView.$inject = ['$transitions', '$log'];
