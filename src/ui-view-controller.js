import map from 'lodash.map';

import { getFullToken } from './utils';
import { getSizeCache, getStyles } from './extendedViews';

export default class UiViewController {
    constructor($element, $scope, $q) {
        const { $cfg } = $element.data('$uiView');
        const deps = $cfg ? map($cfg.viewDecl.resolve, 'token') : [];

        this.$scope = $scope;
        this.wait = promises => $q.all(promises).then(::this.onLoad, ::this.onError);
        this.setLoadingState = (state) => {
            const styles = getStyles();
            const sizeCache = getSizeCache();
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
