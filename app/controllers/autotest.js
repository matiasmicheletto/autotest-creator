app.controller("autotest", ['$scope', '$rootScope', function ($scope, $rootScope) {
    
    //console.log("autotest");
    
    $rootScope.showPreloader("Obteniendo datos...");
    
    $rootScope.logData.actionStack = []; // Registro de interacciones del usuario
    
    middleware.getTree() // Descargar config con diagrama de flujo
    .then(function(config){
        $rootScope.hidePreloader();

        $scope.tree = config.tree;
        $scope.current = config.tree[0]; // Menu actual
        $scope.currentIndex = 0; // Indice actual
        $rootScope.logData.treeID = config.id; // Guardar el id del arbol
        $rootScope.logData.actionStack.push({ // Registrar inicio de autotest
            type: "start",
            timestamp: Date.now()
        });

        $rootScope.$apply();
    })
    .catch(function(err){
        console.log(err);
    });

    $scope.loadMenu = function (menuIndex, optIndex) { // Callback de botones con enlace a sgte nodo
        if(menuIndex > 0){ // Pasar a la siguiente vista
            if ($scope.tree[menuIndex]){ // Control
                $rootScope.logData.actionStack.push({
                    type: "loadMenu", // Tipo de accion
                    from: $scope.currentIndex, // Desde que menu
                    to: menuIndex, // Hacia que menu
                    by: optIndex, // Por cual opcion. (goto->opt[index], decision->dec[index])
                    timestamp: Date.now()
                });
                $scope.current = $scope.tree[menuIndex];
                $scope.currentIndex = menuIndex;
            }
        }
    };

    $scope.toggleButton = function(index){ // Alterna estado de selectores
        if(!$scope.current.options[index].checked) // La primera vez es undefined
            $scope.current.options[index].checked = true;
        else
            $scope.current.options[index].checked = false;
    };

    $scope.evalDecision = function(expr){ // Evalua los toggle seleccionados y decide a cual nodo ir

        // Convertir expresion logica en array (si, cada vez)
        var gotoArray = expr.split(',');
        for(var k in gotoArray)
            gotoArray[k] = parseInt(gotoArray[k]);

        // Generar valor binario de las opciones elegidas
        var binArray = "";
        for(var k in $scope.current.options)
            if($scope.current.options[k].type=="toggle")
                binArray = binArray+($scope.current.options[k].checked ? "1":"0");

        var index = parseInt(binArray,2); // Valor decimal del numero de caso

        $scope.loadMenu(gotoArray[index], index); // Ir al menu correspondiente
    };

    $scope.exit = function(code){ // Finalizacion del test
        $rootScope.logData.exitCode = code;
        $scope.endTest();
    };

    $scope.endTest = function(){ // Callback de finalizacion del test
        $rootScope.logData.timestamp = Date.now(); // Estampa de tiempo de realizacion
        
        $rootScope.showPreloader("Enviando resultados...");

        // Incrementar contadores para estadistica 
        if($rootScope.firstTest){ // Para los datos que no cambian (edad, genero) se cuenta la primera vez
            // Para histograma de edades
            var age = $rootScope.logData.age;
            var updAgeObj = {}; // Objeto de actualizacion
            updAgeObj["range_"+((age - age % 10)/10)] = firebase.firestore.FieldValue.increment(1); // incrementador de rango (range_0, range_1, ...)
            middleware.fs.update(updAgeObj,"stats","ages");

            // Para porcentajes de sexo
            var updGndrObj = {}; // Objeto de actualizacion
            updGndrObj[$rootScope.logData.gender] = firebase.firestore.FieldValue.increment(1);
            middleware.fs.update(updGndrObj,"stats","genders");
        }

        // Para contadores de resultado final
        var updCodeObj = {}; // Objeto de actualizacion
        updCodeObj[$rootScope.logData.exitCode] = firebase.firestore.FieldValue.increment(1);
        middleware.fs.update(updCodeObj,"stats","exitCodes");

        // Para contadores de caminos recorridos
        var updPathObj = {}; // Contadores de caminos para cada arbol
        for(var k = 1; k < $rootScope.logData.actionStack.length; k++){ // Para cada evento de usuario
            if($rootScope.logData.actionStack[k].type=="loadMenu"){ // Tipo de accion es cambio de menu
                var path = "P_"+$rootScope.logData.actionStack[k].from+"_"+$rootScope.logData.actionStack[k].to+"_"+$rootScope.logData.actionStack[k].by;
                updPathObj[path] = firebase.firestore.FieldValue.increment(1);
            }
            
        }
        middleware.fs.update(updPathObj,"pathStats",$rootScope.logData.treeID);

        // Registrar objeto de resultado
        middleware.fs.add($rootScope.logData, "results")
            .then(function(){
                // Fijar un mensaje
                $scope.current = {
                    header: "Gracias por completar el test",
                    content: "Si desea actualizar sus respuestas, puede repetir el test dentro de "+Math.round($rootScope.config.logLimit.elapsed/3600000)+" horas.",
                    options:[
                        {
                            type:"link",
                            text:"Menú principal",
                            href:"#!/"
                        }
                    ]
                };
                $rootScope.hidePreloader();
                $scope.$apply();
            })
            .catch(function(err){ // Si hay error en la carga del resultado, registrar problema en db
                console.log(err);
                // Indicar al usuario del error ocurrido
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