app.controller("home", ['$scope', '$rootScope', function ($scope, $rootScope) {
    
    //console.log("home");

    $rootScope.logData = {}; // Objeto que se va a cargar a la base de datos al finalizar el test
    
    $rootScope.showPreloader("Determinando ubicación...");
    $scope.formAllowed = false; // Impedir uso del formulario

    // Intentar recuperar los datos guardados
    var localData = localStorage.getItem('userData');
    if(localData)
        $scope.userData = JSON.parse(localData);
    
    
    middleware.checkLocation() // Obtener ubicacion del usuario
        .then(function (position) { // Usuario dentro del rango
            $rootScope.hidePreloader();
            
            // Registrar ubicacion del usuario
            $rootScope.logData.lat = position.lat;
            $rootScope.logData.lng = position.lng;

            $scope.formAllowed = true; // Habilitar completar formulario

            $rootScope.toastSuccess("Su ubicación pertenece al área de estudio.");
            $rootScope.$apply();
        })
        .catch(function (err) { // Usuario fuera del rango
            console.log(err);
            $rootScope.hidePreloader();
            $rootScope.toastError("Su ubicación está fuera del área de estudio.");
            $rootScope.$apply();
        });

    $scope.checkForm = function () { // Validacion de formulario

        if(!$rootScope.userAllowed){ // Solo realizar el chequeo mientras el usuario no fue habilitado
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
            * Si ya cargo, preguntar si desea modificar su respuesta con la opcion de salir o proceder
            * Sino, pasar directamente al autotest
            */

            // Guardar los datos de usuario en objeto a registrar en DB
            for(var k in $scope.userData)
                $scope.logData[k] = $scope.userData[k];
            
            $rootScope.userAllowed = true; // Habilitar usuario a realizar el test
        }
    };
}]);