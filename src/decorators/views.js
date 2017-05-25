import mapValues from 'lodash.mapvalues';

import { getFullToken } from '../utils';

export default (state, parent) => {
    function wrap({ resolve, ...view }) {
        return {
            ...view,
            resolve,
            bindings: (resolve || []).reduce((acc, r) => ({
                ...acc,
                [r.token]: `${getFullToken(view.$name, r.token, true)}`,
            }), {}),
        };
    }

    return mapValues(
        parent(state),
        v => (v.resolve && v.component ? wrap(v) : v),
    );
};
