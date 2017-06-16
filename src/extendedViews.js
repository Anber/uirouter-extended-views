export const defaultClasses = {
    view: null,
    loading: null,
};

export default () => {
    const provider = {
        setDefaultClasses(value) {
            Object.assign(defaultClasses, value);
            return provider;
        },
    };

    return {
        $get: () => provider,
        ...provider,
    }
};
