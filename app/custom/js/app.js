var app = angular.module('autotest', ['ngRoute','ngSanitize'])
.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "views/home.html",
            controller: "homeCtrl"
        })
        .when("/about", {
            templateUrl: "views/about.html"
        })
        .when("/help", {
            templateUrl: "views/help.html"
        });
}])
.run(function($rootScope){

    // Inicializacion F7
    var f7 = new Framework7({ // Libreria de estilos
        root: '#app',
        name: 'Autotest COVID19 UNS',
        id: 'com.autotest-covid-uns.test',
        angular: true
    });

    $rootScope.showPreloader = function(message){ // Muestra un preloader mientras carga algunas operaciones
        $rootScope.preloader = f7.dialog.preloader(message, "blue");
    };

    $rootScope.hidePreloader = function(){ // Oculta el preloader si estaba abierto
        if($rootScope.preloader.opened)
            $rootScope.preloader.close();
    };

});

