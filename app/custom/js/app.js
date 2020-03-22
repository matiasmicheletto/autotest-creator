var app = angular.module('autotest', ['ngRoute', 'ngSanitize'])
    .config(["$routeProvider", function ($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "views/home.html",
                controller: "home"
            })
            .when("/autotest", {
                templateUrl: "views/autotest.html",
                controller: "autotest",
                resolve: { // Verificar que el usuario puede realizar el autotest
                    check: ['$rootScope', '$location', function ($rootScope, $location) {
                        if ($rootScope.testAllowed)
                            $location.path('/autotest');
                        else
                            $location.path('/');
                    }]
                }
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
    .run(function ($rootScope) {

        // Inicializacion y componentes de F7
        var f7 = new Framework7({ // Libreria de estilos
            root: '#app',
            name: 'Autotest COVID19 UNS',
            id: 'com.autotest-covid-uns.test',
            angular: true
        });

        $rootScope.showPreloader = function (message) { // Muestra un preloader mientras carga algunas operaciones
            $rootScope.preloader = f7.dialog.preloader(message, "blue");
        };

        $rootScope.hidePreloader = function () { // Oculta el preloader si estaba abierto
            if ($rootScope.preloader.opened)
                $rootScope.preloader.close();
        };

        $rootScope.closePanel = function () {
            f7.panel.close(document.getElementById("panel-menu"), true);
        };

        $rootScope.showDialog = function(title, message, buttons){ // Mostrar un dialogo de confirmacion
            f7.dialog.create({
                title: title,
                text: message,
                buttons: buttons,
                destroyOnClose: true
            }).open();
        };

        $rootScope.toastSuccess = function (message, timeout, position) {
            f7.toast.create({
                text: message,
                position: position || "bottom",
                closeTimeout: timeout || 2000,
                destroyOnClose: true,
                cssClass: "toast-success"
            }).open();
        };
        
        $rootScope.toastError = function (message, timeout, position) {
            f7.toast.create({
                text: message,
                position: position || "bottom",
                closeTimeout: timeout || 2000,
                destroyOnClose: true,
                cssClass: "toast-error"
            }).open();
        };

        $rootScope.userAllowed = false; // Bloquea al usuario si no esta dentro del circulo de acceso
        $rootScope.testAllowed = false; // Admite el uso del autotest
        
        // Iniciar servicios de backend y descargar config
        $rootScope.showPreloader("Cargando...")
        middleware.init()
            .then(function (config) {
                console.log(config);
                $rootScope.config = config;
                $rootScope.hidePreloader();

                // Verificar que el usuario esta dentro del circulo de uso de la app
                $rootScope.logData = {}; // Objeto que se va a cargar a la base de datos al finalizar el test
                $rootScope.showPreloader("Determinando ubicación...");
                middleware.checkLocation($rootScope.config) // Obtener ubicacion del usuario (tambien descarga y actualiza configuracion)
                    .then(function (result) { // Usuario dentro del rango
                        $rootScope.hidePreloader();
                        
                        // Registrar ubicacion del usuario
                        $rootScope.logData.lat = result.lat;
                        $rootScope.logData.lng = result.lng;
            
                        $rootScope.userAllowed = true; // Habilitar completar formulario
            
                        $rootScope.toastSuccess("Su ubicación pertenece al área de estudio.");
                        $rootScope.$apply();
                    })
                    .catch(function (err) { // Usuario fuera del rango
                        console.log(err);
                        $rootScope.hidePreloader();
                        $rootScope.toastError("Su ubicación está fuera del área de estudio.");
                        $rootScope.$apply();
                    });
            })
            .catch(function (err) {
                console.log(err);
            });
    });