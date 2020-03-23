app.controller("dashboard", ['$scope', '$rootScope','$location', function ($scope, $rootScope, $location) {
    
    if(!$rootScope.userLogged){
        $location.path('/login');
    }

    $rootScope.loading = false;

    console.log("dashboard");
    
}]);