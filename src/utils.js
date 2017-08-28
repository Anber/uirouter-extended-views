import { Resolvable, $injector, tail, isArray, pushR } from '@uirouter/core';

export function getFullViewName({ viewDecl: { $uiViewContextAnchor: stateName, $uiViewName: viewName } }) {
    return `${viewName}@${stateName}`;
}

export function normalizeResolvables(resolve = []) {
    if (isArray(resolve)) return resolve;

    return Object.keys(resolve).reduce((array, token) => {
        const r = resolve[token];
        const deps = $injector.annotate(r);
        const providerFn = isArray(r) ? tail(r) : r;
        const resolvable = new Resolvable(token, providerFn, deps);

        return pushR(array, resolvable);
    }, []);
}
