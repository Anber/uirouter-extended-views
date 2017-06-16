import mapValues from 'lodash.mapvalues';

import { getFullToken, normalizeResolvables } from '../utils';

export default (state, parent) => {
    function wrap({ resolve, ...view }) {
        const resolvables = normalizeResolvables(resolve);
        return {
            ...view,
            resolve: resolvables,
            bindings: resolvables.reduce((acc, r) => ({
                ...acc,
                [r.token]: r.token,
            }), {}),
        };
    }

    return mapValues(
        parent(state),
        v => (v.resolve && v.component ? wrap(v) : v),
    );
};
