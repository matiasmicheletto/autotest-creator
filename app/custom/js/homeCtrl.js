app.controller("homeCtrl",["$scope", "$rootScope", function ($scope,$rootScope) { 
// Controller vista home
    console.log("home");
    
    // Descargar config con diagrama de flujo
    $rootScope.showPreloader("Cargando...");
    
    $.getJSON("custom/config.json", function(result) {
        $rootScope.hidePreloader();
        
        console.log(result); 

        $scope.menuList = result.menuList; 
        $scope.current = result.menuList[0];

        $scope.$apply();
    }, function(err){
        console.log(err);
    });

    $scope.loadMenu = function(index){
        if($scope.menuList[index])
            $scope.current = $scope.menuList[index];
    }
}]);