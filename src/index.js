import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import $extendedViews from './extendedViews';
import uiView from './ui-view';
import uiViewErrorHandlerProvider from './ui-view-error-handler';
import decorators from './decorators';

export default angular
    .module('extendedViews', [uiRouter])
    .provider('$extendedViews', $extendedViews)
    .provider('$uiViewErrorHandler', uiViewErrorHandlerProvider)
    .directive('uiView', uiView)
    .config(decorators)
    .name;
