app.controller("home", ['$scope', '$rootScope', function ($scope, $rootScope) {

    $rootScope.showPreloader("Determinando ubicación...");
    middleware.checkLocation() // Obtener ubicacion del usuario
    .then(function() { // Usuario dentro del rango
        $rootScope.hidePreloader();
        $rootScope.$apply();
    })
    .catch(function(err){ // Usuario fuera del rango
        console.log(err);
        $rootScope.hidePreloader();
        $rootScope.userAllowed = false;
        $rootScope.$apply();
    });
    
}]);