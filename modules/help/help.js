angular.module('app').controller('HelpCtrl',function($scope){
    $rootScope.$broadcast('updateNav', {});

});