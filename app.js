angular.module('app', [
    'ui.bootstrap',
    'ui.router',
    'ngAnimate',
    'angular-jwt',
    'angular-storage',
    'uiGmapgoogle-maps'
]);

angular.module('app').config(function($httpProvider, $urlRouterProvider, $stateProvider, jwtInterceptorProvider, uiGmapGoogleMapApiProvider) {

    $stateProvider.state('home', {
        url: '/home',
        templateUrl: 'modules/home/home.html'
    });
    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'modules/login/login.html'
    });
    $stateProvider.state('register', {
        url: '/register',
        templateUrl: 'modules/login/login.html'
    });
    $stateProvider.state('profile', {
        url: '/profile',
        templateUrl: 'modules/profile/profile.html'
    });
    /* Add New States Above */
    $urlRouterProvider.otherwise('/home');

    // Add Token to every request made
    jwtInterceptorProvider.tokenGetter = function(store) {
        return store.get('token');
    };
    $httpProvider.interceptors.push('jwtInterceptor');

    // Configure the google maps
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
});

angular.module('app').run(function($rootScope) {

    /*
     Feature for adding alerts. Can't be done by service/factory
     as those are singeltons.
     */
    $rootScope.alerts = [];
    $rootScope.addAlert = function (type, msg) {
        $rootScope.alerts.push({type: type, msg: msg});
    };
    $rootScope.closeAlert = function (index) {
        $rootScope.alerts.splice(index, 1);
    };
    $rootScope.loggedIn = false;

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
