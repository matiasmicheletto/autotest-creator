var app = angular.module('autotest', ['ngRoute','ngSanitize'])
.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "views/home.html"
        })
        .when("/about", {
            templateUrl: "views/about.html"
        })
        .when("/contact_us", {
            templateUrl: "views/contact_us.html"
        });
}])
.filter('trusted', ['$sce', function ($sce) {
    // Ver: https://stackoverflow.com/questions/39480969/angular-interpolateinterr-error-when-adding-url-from-variable
    return $sce.trustAsResourceUrl;
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

    $rootScope.closePanel = function(){
        f7.panel.close(document.getElementById("panel-menu"), true);
    };

    // Descargar config con diagrama de flujo
    $rootScope.showPreloader("Cargando...");
    
    $.getJSON("custom/config.json", function(result) {
        $rootScope.hidePreloader();
        
        console.log(result); 

        $rootScope.menuList = result.menuList; 
        $rootScope.current = result.menuList[0];

        $rootScope.$apply();
    }, function(err){
        console.log(err);
    });

    $rootScope.loadMenu = function(index){
        if($rootScope.menuList[index])
            $rootScope.current = $rootScope.menuList[index];
    }

});

