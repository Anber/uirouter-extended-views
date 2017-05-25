import { Resolvable } from '@uirouter/angularjs';

import flatMap from 'lodash.flatmap';
import compact from 'lodash.compact';

import { getFullToken } from '../utils';

function prepare({ name, resolvable }) {
    const policy = resolvable.policy || {};
    return new Resolvable(
        getFullToken(name, resolvable.token),
        resolvable.resolveFn,
        resolvable.deps,
        { ...policy, async: 'NOWAIT' },
        resolvable.data,
    );
}

export default (state, parent) => {
    const resolves = compact(flatMap(
        state.views,
        v => (v.resolve || []).map(r => ({ name: v.$name, resolvable: r })),
    ));
    const resolvables = parent(state);
    if (resolves.length === 0) return resolvables;

    return [
        ...resolvables,
        ...resolves.map(view => prepare(view)),
    ];
}
