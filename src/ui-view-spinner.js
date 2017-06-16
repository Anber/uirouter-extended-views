import { noop } from '@uirouter/angularjs';
import { defaultClasses } from './extendedViews';

export default class UiViewSpinner {
    show = noop;
    hide = noop;

    static attachTo($element) {
        const instance = new UiViewSpinner($element);
        $element.data('$$uiViewSpinnerController', instance);

        return instance;
    }

    constructor($element) {
        const loadingClass = $element.attr('loading-class') || defaultClasses.loading;

        if (!loadingClass) return;

        this.show = () => $element.addClass(loadingClass);
        this.hide = () => $element.removeClass(loadingClass);
    }
}
