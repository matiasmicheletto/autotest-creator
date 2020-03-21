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
                        if ($rootScope.userAllowed)
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

        $rootScope.toastSuccess = function (message, timeout) {
            f7.toast.create({
                text: message,
                closeTimeout: timeout || 2000,
                destroyOnClose: true,
                cssClass: "toast-success"
            }).open();
        };
        
        $rootScope.toastError = function (message, timeout) {
            f7.toast.create({
                text: message,
                closeTimeout: timeout || 2000,
                destroyOnClose: true,
                cssClass: "toast-error"
            }).open();
        };

        $rootScope.userAllowed = false; // Admite el uso del autotest

        $rootScope.showPreloader("Cargando...");

        // Iniciar servicios de backend
        middleware.init()
            .then(function (res) {
                console.log(res);
                $rootScope.hidePreloader();
            })
            .catch(function (err) {
                console.log(err);
            });
    });