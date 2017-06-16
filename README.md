## Installation

~~~
npm install --save uirouter-extended-views
~~~

## Usage

~~~ javascript
import extendedViewsModule from 'uirouter-extended-views';

angular.module('myApp', [extendedViewsModule]);
~~~

Now you can use resolve with components inside views: 
~~~ javascript
{
    name: 'root',
    url: '/',
    views: {
        '@': {
            component: 'testComponent',
            resolve: [
                {
                    token: 'user', // user will be bound to testComponent's controller 
                    resolveFn: () => ({ login: '…', email: '…' }),
                }
            ],
        },
    },
}
~~~

Component's render will be delayed until all resolves' promises are ready.
~~~ javascript
{
    component: 'testComponent', // will be rendered with resolved user
    resolve: [
        {
            token: 'user', 
            deps: ['UserService', Transition],
            resolveFn: (userSvc, trans) => userSvc.fetchUser(trans.params().userId) },
        }
    ],
},
~~~

If you want to show any preloader in your view, you can specify css class which will be added to ui-view, while it is loading a data:
~~~ javascript
app.config(($extendedViewsProvider) => {
    'ngInject';

    $extendedViewsProvider.setDefaultClasses({
        loading: 'loading',
    });
});
~~~
