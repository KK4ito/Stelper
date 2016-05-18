angular.module('app', [
    'ui.bootstrap',
    'ui.router',
    'ngAnimate',
    'angular-md5',
    'angular-jwt',
    'angular-storage',
    'uiGmapgoogle-maps',
    'naif.base64'
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
    $stateProvider.state('help', {
        url: '/help',
        templateUrl: 'modules/help/help.html'
    });
    /* Add New States Above */
    $urlRouterProvider.otherwise('/home');

    // Add Token to every request made
    jwtInterceptorProvider.tokenGetter = ['jwtHelper','store', function(jwtHelper, store, $state) {
        var idToken = store.get('token');
        if (store.get('token') !== null && jwtHelper.isTokenExpired(idToken)) {
            //$state.go('login');
            store.remove('token');
            idToken = store.get('token');
        }

        return idToken;
    }];
    $httpProvider.interceptors.push('jwtInterceptor');

    // Configure the google maps
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
});

angular.module('app').run(function(store, $rootScope, $timeout) {

    /*
     Feature for adding alerts. Can't be done by service/factory
     as those are singeltons.
     */
    $rootScope.alerts = [];
    $rootScope.addAlert = function (type, msg) {
        $rootScope.alerts.push({type: type, msg: msg});
        $timeout(function () {
            $rootScope.alerts.splice($rootScope.alerts.length-1, 1);
        }, 4000);
    };
    $rootScope.closeAlert = function (index) {
        $rootScope.alerts.splice(index, 1);
    };

});
