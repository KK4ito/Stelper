angular.module('app', ['ui.bootstrap','ui.router','ngAnimate', 'ngStorage']);

angular.module('app').constant('urls', {
    BASE: 'http://localhost',
    BASE_API: 'http://localhost/api'
});

angular.module('app').config(function($stateProvider, $urlRouterProvider) {

    $stateProvider.state('signin', {
        url: '/',
        templateUrl: 'modules/dashboard/signin.html'
    });
    $stateProvider.state('signup', {
        url: '/signup',
        templateUrl: 'modules/dashboard/signup.html'
    });
    $stateProvider.state('dashboard', {
        url: '/dashboard',
        templateUrl: 'modules/dashboard/dashboard.html'
    });
    $stateProvider.state('anbieten', {
        url: '/anbieten',
        templateUrl: 'modules/anbieten/anbieten.html'
    });
    /* Add New States Above */
    $urlRouterProvider.otherwise('/');

});

angular.module('app').run(function($rootScope) {

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
