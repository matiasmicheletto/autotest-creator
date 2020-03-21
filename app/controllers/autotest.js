app.controller("autotest", ['$scope', '$rootScope', function ($scope, $rootScope) {

    middleware.getLocalConfig() // Descargar config con diagrama de flujo
    .then(function(config){
        $rootScope.hidePreloader();

        $scope.decisionTree = config.decisionTree;
        $scope.current = config.decisionTree[0];

        $rootScope.$apply();
    })
    .catch(function(err){
        console.log(err);
    });

    $scope.loadMenu = function (index) { // Callback de los botones
        if ($scope.decisionTree[index])
            $scope.current = $scope.decisionTree[index];
    };

}]);