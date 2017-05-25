let styles = null;
let sizeCache = null;

export const getStyles = () => styles;
export const getSizeCache = () => sizeCache;

export default () => {
    const provider = {
        setStyles(value) {
            styles = value;
            return provider;
        },
        setSizeCache(value) {
            sizeCache = value;
            return provider;
        },
    };

    return {
        $get: () => provider,
        ...provider,
    }
};
