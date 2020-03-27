app.controller("home", ['$scope', '$rootScope', function ($scope, $rootScope) {
    
    //console.log("home");
    $rootScope.testAllowed = false; // Admite el uso del autotest

    // Intentar recuperar los datos guardados
    var localData = localStorage.getItem('userData');
    //console.log(localData);
    if(localData)
        $scope.userData = JSON.parse(localData);
    else
        $scope.userData = {};

  
    $scope.resetCheck = function(){ // Reinicia el estado del checkeo
        $rootScope.testAllowed = false; // No se puede poner en el ng-change porque es variable de $root
    };

    $scope.checkForm = function () { // Validacion de formulario

        if(!$rootScope.testAllowed){ // Solo realizar el chequeo mientras el usuario no fue habilitado
            //console.log($scope.userData);

            if (!$scope.userData) {
                $rootScope.toastError("Debe completar su nombre");
                return;
            }

            if (!$scope.userData.name) {
                $rootScope.toastError("Debe completar su nombre");
                return;
            }

            if (!$scope.userData.age) {
                $rootScope.toastError("Por favor, indique su edad");
                return;
            }

            if (!$scope.userData.dni) {
                $rootScope.toastError("Debe completar su DNI");
                return;
            } else {
                if ($scope.userData.dni < 100000) {
                    $rootScope.toastError("Su DNI no parece un número válido");
                    return;
                }
            }

            if (!$scope.userData.tel) {
                $rootScope.toastError("Por favor, indique un teléfono");
                return;
            }

            if (!$scope.userData.gender) {
                $rootScope.toastError("Debe indicar su género");
                return;
            }

            // Guardar formulario para que no tenga que recompletar
            localStorage.setItem("userData", JSON.stringify($scope.userData));

            /* 
            * Si llega hasta aca, completo todos los datos. Verificar si ya cargo un test
            * Si ya cargo, preguntar si desea modificar su respuesta con la opcion de salir o proceder.
            * Puede cargar hasta 3 respuestas diferentes (?)
            * Sino, pasar directamente al autotest
            */

            var allowAutotest = function(){ // Callback para dar el ok de iniciar el autotest
                for(var k in $scope.userData) // Guardar los datos de usuario en objeto a registrar en DB
                    $scope.logData[k] = $scope.userData[k];
                $rootScope.testAllowed = true; // Habilitar usuario a realizar el test
                $rootScope.toastSuccess("Habilitado para iniciar el autotest", 1500, "center");
                $rootScope.$apply();
            };

            $rootScope.showPreloader("Verificando datos...");
            middleware.fs.query("results", "dni", "==", $scope.userData.dni)
            .then(function(results){
                $rootScope.hidePreloader();
                // Definir valores por defecto en caso de que la base de datos no traiga nada
                var limits = {
                    max: 3,
                    elapsed: 86400000
                };
                if($rootScope.config)
                    if($rootScope.config.logLimit)
                        limits = { 
                            max: $rootScope.config.logLimit.max,
                            elapsed: $rootScope.config.logLimit.elapsed
                        };
                if(results.length >= limits.max){ // Ya hay [max] registros guardados, no puede cargar mas
                    $rootScope.showDialog("Límite de resultados",
                        "El DNI indicado ya alcanzó el límite de "+limits.max+" autotests diferentes.",
                        [{text:"Aceptar"}]
                    );
                }else{
                    if(results.length == 0){ // Si no hay resultados guardados para este dni, iniciar
                        $rootScope.firstTest = true; // Testigo para habilitar contadores de estadistica
                        allowAutotest();
                    }else{ // Si hay entre 0 y 3 resultados, revisar fecha del ultimo
                        // Obtener maximo
                        var lastTimestamp = 0;
                        for(var k in results){
                            if(results[k].timestamp > lastTimestamp)
                                lastTimestamp = results[k].timestamp;
                        }
                        if(Date.now() - lastTimestamp < limits.elapsed){
                            $rootScope.showDialog("Límite de resultados",
                                "Debe transcurrir "+Math.round($rootScope.config.logLimit.elapsed/3600000)+"hs. desde la última vez que realizó el autotest para realizar uno nuevo.",
                                [{text:"Aceptar"}]
                            );
                        }else{
                            $rootScope.showDialog("Se encontraron registros",
                                "El DNI indicado ya registró <b>"+results.length+"</b> resultado/s. Puede realizar un máximo de "+$rootScope.config.logLimit.max+".",
                                [{
                                    text: "Aceptar",
                                    onClick: function() {
                                        allowAutotest();
                                    }
                                }]
                            );
                        }
                    }
                }
            })
            .catch(function (err) { 
                console.log(err);
                $rootScope.hidePreloader();
                $rootScope.$apply();
            });
        }
    };
}]);