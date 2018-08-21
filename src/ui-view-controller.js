import { ResolveContext, any } from '@uirouter/core';

import UiViewSpinner from './ui-view-spinner';
import contentCache from './content-cache';

export default class UiViewController {
    onDestroyCallbacks = [];

    constructor($animate, $state, $element, $scope, $q) {
        $animate.enabled($element, false);

        this.$state = $state;
        this.$element = $element;

        const spinner = UiViewSpinner.attachTo($element);

        const { $cfg } = $element.data('$uiView');
        this.deps = $cfg && $cfg.viewDecl.resolve || [];

        if ($cfg) {
            $element.html(contentCache.get($cfg.viewDecl) || undefined);
        }

        this.$scope = $scope;

        if (this.deps.length) {
            const resolveCtx = $cfg.path && new ResolveContext($cfg.path);
            $scope.$watchGroup(
                this.deps.map(token => () => resolveCtx.getResolvable(token).get(resolveCtx)),
                (promises) => {
                    spinner.show();

                    if (!any(p => p !== undefined)(promises)) {
                        return;
                    }

                    $q.all(promises).finally(() => spinner.hide());
                },
            );
        }
    }

    $onDestroy() {
        const $uiView = this.$element.data('$uiView');
        if (!$uiView || !$uiView.$cfg) return;

        const $cfg = $uiView.$cfg;
        const $element = this.$element;

        const trans = this.$state.transition;
        if (trans) {
            const entering = trans.entering();
            const exiting = trans.exiting().filter(node => entering.indexOf(node) === -1);
            if (exiting.indexOf($cfg.viewDecl.$context.self) !== -1) {
                contentCache.delete($cfg.viewDecl);
            } else {
                contentCache.set($cfg.viewDecl, $element.html());
            }
        }

        this.onDestroyCallbacks.forEach(fn => fn());
    }

    onDestroy(fn) {
        this.onDestroyCallbacks.push(fn);
    }
}

UiViewController.$inject = ['$animate', '$state', '$element', '$scope', '$q'];
