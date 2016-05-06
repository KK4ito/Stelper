angular.module('app', [
    'ui.bootstrap',
    'ui.router',
    'ngAnimate',
    'angular-jwt',
    'angular-storage',
    'uiGmapgoogle-maps'
]);

angular.module('app').config(function($httpProvider, $urlRouterProvider, jwtInterceptorProvider, $stateProvider, uiGmapGoogleMapApiProvider) {

    $stateProvider.state('home', {
        url: '/home',
        templateUrl: 'modules/home/home.html'
    });
    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'modules/login/login.html'
    });
    /* Add New States Above */
    $urlRouterProvider.otherwise('/home');

    jwtInterceptorProvider.tokenGetter = function(store) {
        return store.get('jwt');
    };

    $httpProvider.interceptors.push('jwtInterceptor');

    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
});

angular.module('app').run(function($rootScope, $state, store, jwtHelper) {

    $rootScope.$on('$stateChangeStart', function(e, to) {
        if (to.data && to.data.requiresLogin) {
            if (!store.get('jwt') || jwtHelper.isTokenExpired(store.get('jwt'))) {
                e.preventDefault();
                $state.go('login');
            }
        }
    });

    /*
    For custom functions or pure javascript functions,
    we have to apply them to make them work with angular.
    Basically we tell angular that it should use a non-
    Angular function. This safeApply is a better version of
    The basic $apply of Angular itself.
     */
    $rootScope.safeApply = function(fn) {
        var phase = $rootScope.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

});
