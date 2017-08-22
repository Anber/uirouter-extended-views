import { getNg1ViewConfigFactory } from '@uirouter/angularjs';
import { Resolvable, ResolveContext } from '@uirouter/core';

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
                    if (!$cfg || !$cfg.viewDecl.resolve || !$cfg.viewDecl.resolve.length) {
                        linkFn(scope, $element, attr);
                        return;
                    }

                    const { resolve } = $cfg.viewDecl;
                    const resolveCtx = $cfg.path && new ResolveContext($cfg.path);
                    const getAsync = token => resolveCtx && resolveCtx.getResolvable(token).get(resolveCtx);
                    $q.all(resolve.map(r => getAsync(r))).then((values) => {
                        const [newCfg] = ng1ViewConfigFactory([
                            ...$cfg.path,
                            {
                                state: {},
                                resolvables: resolve.map((r, idx) => Resolvable.fromData(
                                    r.token,
                                    values[idx],
                                )),
                            },
                        ], $cfg.viewDecl);

                        return newCfg.load();
                    }).then((newCfg) => {
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
