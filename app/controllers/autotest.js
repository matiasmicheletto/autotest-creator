app.controller("autotest", ['$scope', '$rootScope', function ($scope, $rootScope) {
    
    //console.log("autotest");
    
    $rootScope.showPreloader("Obteniendo datos...");
    
    $rootScope.logData.actionStack = []; // Registro de interacciones del usuario
    
    middleware.getTree() // Descargar config con diagrama de flujo
    .then(function(config){
        $rootScope.hidePreloader();

        $scope.tree = config.tree;
        $scope.current = config.tree[0];
        $rootScope.logData.treeID = config.id; // Guardar el id del arbol
        $rootScope.logData.actionStack.push({ // Registrar primer menu
            index: "0",
            timestamp: Date.now()
        });

        $rootScope.$apply();
    })
    .catch(function(err){
        console.log(err);
    });

    $scope.loadMenu = function (index) { // Callback de los botones
        if(index == -1){ // Indicador de finalizacion del test
            $scope.endTest();
        }else{ // Pasar a la siguiente vista
            if ($scope.tree[index]){
                $rootScope.logData.actionStack.push({
                    index: index,
                    timestamp: Date.now()
                });
                $scope.current = $scope.tree[index];
            }
        }
    };

    $scope.endTest = function(){ // Callback de finalizacion del test
        console.log($rootScope.logData);
    };
}]);