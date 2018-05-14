export default function uiViewErrorHandlerProvider() {
    const handlers = [];

    function service($log) {
        return (stage, err) => {
            let handler;
            let data = err;
            const queue = [...handlers];
            while (data && (handler = queue.shift())) {
                data = handler(stage, err);
            }

            if (data) {
                $log.error(stage, data);
            }
        }
    }

    service.$inject = ['$log'];

    this.$get = service;

    this.addHandler = (fn) => {
        handlers.push(fn);
    };
}

uiViewErrorHandlerProvider.$inject = [];
