app.controller("config", ['$scope', '$rootScope', function ($scope, $rootScope) {
    
    if(!$rootScope.userLogged){
        $location.path('/login');
    }

    console.log("config");
    
}]);