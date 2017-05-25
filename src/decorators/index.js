import resolvables from './resolvables';
import views from './views';
import uiViewDirective from './ui-view-directive';

export default function config($stateProvider, $provide) {
    $stateProvider.decorator('resolvables', resolvables);
    $stateProvider.decorator('views', views);
    $provide.decorator('uiViewDirective', uiViewDirective);
}

config.$inject = ['$stateProvider', '$provide'];
