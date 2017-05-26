import { RejectType } from '@uirouter/angularjs';

import UiViewController from './ui-view-controller';
import { getFullViewName } from './utils';
import { getSizeCache, getStyles } from './extendedViews';

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
        const { entering, exiting, retained } = trans.treeChanges();
        const touchedStates = [...entering, ...exiting, ...retained];
        const touchedViews = touchedStates.reduce((acc, path) => [...acc, ...(path.views || [])], []);
        const touchedViewsNames = touchedViews.map(getFullViewName);

        const distinctView = new Set(touchedViewsNames);
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
        scope: {
            track: '<',
        },
        controller: UiViewController,
        compile: () => (scope, $element, attr) => {
            const styles = getStyles();
            const sizeCache = getSizeCache();

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
}

uiView.$inject = ['$transitions', '$log'];
