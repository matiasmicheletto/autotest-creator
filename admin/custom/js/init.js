var app = angular.module('autotest-admin', ['ngRoute', 'ngSanitize'])
    .run(["$rootScope","$location", function ($rootScope,$location) {

        $rootScope.userLogged = false;
        $rootScope.loading = true;

        middleware.init();

        $location.path('/login');

        middleware.users.onUserSignedIn = function(uid){ // Callback usuario logeado
            // Descargar configuracion actual
            middleware.db.get("config")
                .then(function(configData){
                    
                    $rootScope.config = configData;
                    $rootScope.config.trees = [];

                    // Arbol de decisiones en entrada aparte (y descarga por timestamp)
                    middleware.db.getSorted("decisionTrees", "timestamp")
                        .then(function(snapshot){
                            snapshot.forEach(function(tree){
                                var t = tree.val();
                                t.key = tree.key;
                                $rootScope.config.trees.push(t);
                            });
                            // Ir al tablero
                            $rootScope.userLogged = true;
                            $rootScope.loading = false;
                            $location.path('/');
                            $rootScope.$apply();
                        })
                        .catch(function(err2){
                            console.log(err2);
                            toastr.error("Ocurrió un error al descargar la configuración global.");
                            $rootScope.loading = false;
                            $scope.$apply();
                        });
                })
                .catch(function(err){
                    console.log(err);
                    toastr.error("Ocurrió un error al descargar la configuración global.");
                    $rootScope.loading = false;
                    $scope.$apply();
                });            
        };

        middleware.users.onUserSignedOut = function(){ // Callback usuario deslogeado
            $rootScope.userLogged = false;
            $rootScope.loading = false;
            $location.path('/login');
            $rootScope.$apply();
        };

        $rootScope.logout = function(){
            $rootScope.loading = true;
            middleware.users.signOut();
        };


        // Utils
        $rootScope.getTime = function(stamp, format){ // Para ejecutar moment en view
            var time;
            if(!format) format = 3;
            if(!stamp) format = 1;
            switch(format){
                case 0: // Estampa de tiempo en view
                    time = Date.now();
                    break;
                case 1: // Fecha y hora actual
                    time = moment(Date.now()).format("DD/MM/YYYY HH:mm");
                    break;
                case 2: // Solo fecha actual
                    time = moment(Date.now()).format("DD/MM/YYYY");
                    break;
                case 3: // Fecha y hora de argumento
                    time = moment(stamp).format("DD/MM/YYYY HH:mm");
                    break;
                case 4: // Solo fecha de argumento
                    time = moment(stamp).format("DD/MM/YYYY");
                    break;
                case 5: // Relativo al actual
                    time = moment(stamp).fromNow();
                    break;
                case 6: // Fecha corta y hora
                    time = moment(stamp).format("DD/MM HH:mm");
                    break;
                default:
                    time = null;
            }
            return time;
        };

        $rootScope.html2Text = function(content){
            var temp = document.createElement("div");
            temp.innerHTML = content;
            return temp.textContent || temp.innerText || "";
        };
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