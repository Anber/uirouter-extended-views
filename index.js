import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import $extendedViews from './src/extendedViews';
import uiView from './src/ui-view';
import decorators from './src/decorators';

export default angular
    .module('extendedViews', [uiRouter])
    .provider('$extendedViews', $extendedViews)
    .directive('uiView', uiView)
    .config(decorators)
    .name;
