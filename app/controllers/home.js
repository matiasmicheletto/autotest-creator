app.controller("home", ['$scope', '$rootScope', function ($scope, $rootScope) {

    $rootScope.showPreloader("Determinando ubicación...");
    middleware.checkLocation() // Obtener ubicacion del usuario
    .then(function(position) { // Usuario dentro del rango
        $rootScope.hidePreloader();
    })
    .catch(function(err){ // Usuario fuera del rango
        console.log(err);
        $rootScope.hidePreloader();
    });
    
}]);