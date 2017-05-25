import { getNg1ViewConfigFactory, Resolvable, ResolveContext, getLocals } from '@uirouter/angularjs';

import { getFullToken } from '../utils';

const ng1ViewConfigFactory = getNg1ViewConfigFactory();

export default function uiViewDirective($delegate, $q) {
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
}

uiViewDirective.$inject = ['$delegate', '$q'];
