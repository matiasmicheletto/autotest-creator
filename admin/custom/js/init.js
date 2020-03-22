var app = angular.module('autotest-admin', ['ngRoute', 'ngSanitize'])
    .run(["$rootScope", function ($rootScope) {

        console.log("init");
        $rootScope.userLogged = true; // TODO: quitar

    }])
    .config(["$routeProvider", function ($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "views/dashboard.html",
                controller: "dashboard"
            })
            .when("/login", {
                templateUrl: "views/login.html",
                controller: "login"
            })
            .when("/config", {
                templateUrl: "views/config.html",
                controller: "config"
            });
    }])
    .filter('trusted', ['$sce', function ($sce) {
        // Ver: https://stackoverflow.com/questions/39480969/angular-interpolateinterr-error-when-adding-url-from-variable
        return $sce.trustAsResourceUrl;
    }]);