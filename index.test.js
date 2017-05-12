import angular from 'angular';
import defaultsDeep from 'lodash.defaultsdeep';
import 'angular-mocks';
import uiRouter from '@uirouter/angularjs';
import extendedViewsModule from './index';

const module = angular.mock.module;

describe('extendedViews', () => {
    let $rootScope;
    let $state;
    let $stateProvider;
    let $compile;
    let $timeout;
    let elem;

    const baseState = {
        name: 'root',
        url: '/',
    };

    function defineState(state = {}) {
        $stateProvider.state(defaultsDeep({}, baseState, state));
    }

    function go(state = {}) {
        defineState(state);

        elem.append($compile('<div><ui-view></ui-view></div>')($rootScope.$new()));
        $state.transitionTo('root');
        $rootScope.$apply();
        $timeout.flush();
    }

    let _scope;
    function controller($scope) { _scope = $scope; }

    beforeEach(() => {
        _scope = null;
        angular
            .module('testApp', [uiRouter, extendedViewsModule])
            .component('testComponent', {
                bindings: {
                    nestedResolve: '<',
                },
                template: '<div></div>',
                controller,
            });

        module('testApp');
    });

    beforeEach(module((_$stateProvider_, $extendedViewsProvider) => {
        $stateProvider = _$stateProvider_;

        $extendedViewsProvider.setStyles({
            loading: 'loading',
            view: 'view',
        })
    }));

    beforeEach(inject((_$state_, _$timeout_, _$compile_, _$rootScope_) => {
        $rootScope = _$rootScope_;
        $state = _$state_;
        $timeout = _$timeout_;
        $compile = _$compile_;
        elem = angular.element('<div>');
    }));

    it('should be properly initialized', inject(($state) => {
        defineState();
        expect($state.href('root', {})).toEqual('#!/');
    }));

    it('should bind resolved string to component', inject(() => {
        const resolveFn = jest.fn().mockReturnValue('resolved value');
        go({
            views: {
                '@': {
                    component: 'testComponent',
                    resolve: [
                        {
                            token: 'nestedResolve',
                            resolveFn,
                        }
                    ],
                },
            },
        });

        expect(resolveFn).toBeCalled();
        expect(_scope.$ctrl.nestedResolve).toEqual('resolved value');
    }));

    it('should bind resolved string to component in nested view', inject(() => {
        const resolveFn = jest.fn().mockReturnValue('resolved value');
        go({
            views: {
                '@': {
                    template: '<ui-view></ui-view>',
                },
                '@root': {
                    component: 'testComponent',
                    resolve: [
                        {
                            token: 'nestedResolve',
                            resolveFn,
                        }
                    ],
                },
            },
        });

        expect(resolveFn).toBeCalled();
        expect(_scope.$ctrl.nestedResolve).toEqual('resolved value');
    }));

    it('should wait promise', async () => {
        let resolve;
        const promise = new Promise((_resolve_ => { resolve = _resolve_ }));
        const resolveFn = jest.fn().mockReturnValue(promise);
        go({
            views: {
                '@': {
                    component: 'testComponent',
                    resolve: [
                        {
                            token: 'nestedResolve',
                            resolveFn,
                        }
                    ],
                },
            },
        });

        expect(resolveFn).toBeCalled();

        expect(_scope).toBe(null);
        resolve('resolved value');

        const res = await promise;
        expect(res).toEqual('resolved value');

        $rootScope.$apply();
        $timeout.flush();

        expect(_scope.$ctrl.nestedResolve).toEqual('resolved value');
    });

    it('should add and remove loading class', async () => {
        let resolve;
        const promise = new Promise((_resolve_ => { resolve = _resolve_ }));
        const resolveFn = jest.fn().mockReturnValue(promise);
        go({
            views: {
                '@': {
                    component: 'testComponent',
                    resolve: [
                        {
                            token: 'nestedResolve',
                            resolveFn,
                        }
                    ],
                },
            },
        });

        expect(elem.find('ui-view').hasClass('view')).toBeTruthy();
        expect(elem.find('ui-view').hasClass('loading')).toBeTruthy();

        expect(resolveFn).toBeCalled();

        expect(_scope).toBe(null);
        resolve('resolved value');

        const res = await promise;
        expect(res).toEqual('resolved value');

        $rootScope.$apply();
        $timeout.flush();

        expect(elem.find('ui-view').hasClass('loading')).toBeFalsy();
    });
});
