const cacheObj = {};
export default {
    get(view) {
        return cacheObj[view.$name];
    },

    delete(view) {
        delete cacheObj[view.$name];
    },

    set(view, value) {
        cacheObj[view.$name] = value;
    },
};
