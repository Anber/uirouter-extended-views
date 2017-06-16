import { Resolvable, flatten, values } from '@uirouter/angularjs';

import { normalizeResolvables } from '../utils';

function prepare(resolvable) {
    const policy = resolvable.policy || {};
    return new Resolvable(
        resolvable,
        (...args) => resolvable.resolveFn(...args),
        resolvable.deps,
        { ...policy, async: 'NOWAIT' },
        resolvable.data,
    );
}

export default (state, parent) => {
    const allStateResolvables = flatten(state.path.map(node => node.resolvables))
        .filter(r => r)
        .map(r => r.token);

    const resolves = flatten(values(state.views).map(v => normalizeResolvables(v.resolve)))
        .filter(r => r && allStateResolvables.indexOf(r) === -1);

    const resolvables = parent(state);
    if (resolves.length === 0) return resolvables;

    const prepared = resolves.map(r => prepare(r));
    return [
        ...resolvables,
        ...prepared,
    ];
}
