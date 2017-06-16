import { Resolvable } from '@uirouter/angularjs';

import flatMap from 'lodash.flatmap';
import compact from 'lodash.compact';

import { getFullToken, normalizeResolvables } from '../utils';

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
    const resolves = compact(flatMap(
        state.views,
        v => normalizeResolvables(v.resolve),
    ));
    const resolvables = parent(state);
    if (resolves.length === 0) return resolvables;

    const prepared = resolves.map(r => prepare(r));
    return [
        ...resolvables,
        ...prepared,
    ];
}
