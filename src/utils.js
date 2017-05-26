import md5 from 'js-md5';
import { Resolvable, $injector, tail, isArray, pushR } from '@uirouter/angularjs';

export function getFullToken(viewName, origToken, sync = false) {
    const viewHash = md5(viewName);
    return `${origToken}$${viewHash}${sync ? '$sync' : ''}`;
}

export function getFullViewName({ viewDecl: { $uiViewContextAnchor: stateName, $name: viewName } }) {
    return viewName.indexOf('@') >= 0 ? viewName : `${viewName}@${stateName}`;
}

export function normalizeResolvables(resolve = []) {
    if (isArray(resolve)) return resolve;

    return Object.keys(resolve).reduce((array, token) => {
        const r = resolve[token];
        const deps = $injector.annotate(r);
        const providerFn = isArray(r) ? tail(r) : r;
        const resolvable = new Resolvable(token, providerFn, deps);

        return pushR(array, resolvable);
    }, [])
}
