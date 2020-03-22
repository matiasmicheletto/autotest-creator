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

    $scope.loadMenu = function (index, exitCode) { // Callback de los botones
        if(exitCode) // Registrar si hay codigo de finalizacion
            $rootScope.logData.exitCode = exitCode;
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
        $rootScope.logData.timestamp = Date.now(); // Estampa de tiempo de realizacion

        //console.log($rootScope.logData);

        $rootScope.showPreloader("Enviando resultados...");
        middleware.fs.add($rootScope.logData, "results")
            .then(function(){
                // Fijar un mensaje
                $scope.current = {
                    header: "Gracias por completar el test",
                    content: "Si desea cambiar sus respuestas, puede repetir el test dentro de 24hs.",
                    options:[
                        {
                            text:"Menú principal",
                            href:"#!/"
                        }
                    ]
                };
                $rootScope.hidePreloader();
                $scope.$apply();
            })
            .catch(function(err){ // Si hay error en la carga del resultado, registrar problema
                console.log(err);
                $scope.current = {
                    header: "El resultado no pudo registrarse",
                    content: "Hemos enviado datos del problema para tabajar en la solución. Vuelva a intentarlo más tarde.",
                    options:[
                        {
                            text:"Menú principal",
                            href:"#!/"
                        }
                    ]
                };
                var errorLog = {
                    errMsg: JSON.stringify(err),
                    timestamp: Date.now(),
                    origin: "autotest.js/$scope.endTest"
                };
                middleware.fs.add(errorLog, "errorLogs")
                    .then(function(){
                        $rootScope.hidePreloader();
                        $scope.$apply();
                    })
                    .catch(function(err2){ // Error en el registro de error ya es demasiado
                        console.log(err2);
                        $rootScope.hidePreloader();
                        $scope.$apply();
                    });
            });
    };
}]);