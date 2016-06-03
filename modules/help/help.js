angular.module('app').controller('HelpCtrl',function($scope, $rootScope){
    $rootScope.$broadcast('updateNav', {});

});
