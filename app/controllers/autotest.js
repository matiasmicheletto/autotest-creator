app.controller("autotest", ['$scope', '$rootScope', function ($scope, $rootScope) {

    $rootScope.showPreloader("Obteniendo datos...");
    middleware.getTree() // Descargar config con diagrama de flujo
    .then(function(config){
        $rootScope.hidePreloader();

        $scope.tree = config.tree;
        $scope.current = config.tree[0];

        $rootScope.$apply();
    })
    .catch(function(err){
        console.log(err);
    });

    $scope.loadMenu = function (index) { // Callback de los botones
        if ($scope.tree[index])
            $scope.current = $scope.tree[index];
    };

}]);