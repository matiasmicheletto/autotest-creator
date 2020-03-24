var app = angular.module('autotest-admin', ['ngRoute', 'ngSanitize'])
    .run(["$rootScope", "$location", function ($rootScope, $location) {

        $rootScope.userLogged = false;
        $rootScope.loading = true;

        middleware.init();

        $location.path('/login');

        middleware.users.onUserSignedIn = function (uid) { // Callback usuario logeado
            // Descargar configuracion actual
            middleware.db.get("config")
                .then(function (configData) {

                    $rootScope.config = configData;
                    $rootScope.config.trees = [];

                    // Arbol de decisiones en entrada aparte (y descarga por timestamp)
                    middleware.db.getSorted("decisionTrees", "timestamp")
                        .then(function (snapshot) {
                            snapshot.forEach(function (tree) {
                                var t = tree.val();
                                t.key = tree.key;
                                t.editable = false; // Ningun arbol de la base de datos puede ser editado
                                $rootScope.config.trees.push(t);
                            });
                            // Ir al tablero
                            $rootScope.userLogged = true;
                            $rootScope.loading = false;
                            $location.path('/');
                            $rootScope.$apply();
                        })
                        .catch(function (err2) {
                            console.log(err2);
                            toastr.error("Ocurrió un error al descargar la configuración global.");
                            $rootScope.loading = false;
                            $scope.$apply();
                        });
                })
                .catch(function (err) {
                    console.log(err);
                    toastr.error("Ocurrió un error al descargar la configuración global.");
                    $rootScope.loading = false;
                    $scope.$apply();
                });
        };

        middleware.users.onUserSignedOut = function () { // Callback usuario deslogeado
            $rootScope.userLogged = false;
            $rootScope.loading = false;
            $location.path('/login');
            $rootScope.$apply();
        };

        $rootScope.logout = function () {
            $rootScope.loading = true;
            middleware.users.signOut();
        };


        // Utils
        $rootScope.getTime = function (stamp, format) { // Para ejecutar moment en view
            var time;
            if (!format) format = 3;
            if (!stamp) format = 1;
            switch (format) {
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

        $rootScope.html2Text = function (content) { // Convierte contenido html en texto plano
            var temp = document.createElement("div");
            temp.innerHTML = content;
            return temp.textContent || temp.innerText || "";
        };

        $rootScope.showHelp = function (ref) { // Ayuda en pantalla
            switch (ref) {
                case "main-config":
                    $rootScope.helpContent = "<p>Configure los parámetros de funcionamiento de la aplicación y presione \"Guardar\" para que la configuración tome efecto o \"Descartar\" para reestablecer los cambios a los valores activos.</p>";
                    break;
                case "map":
                    $rootScope.helpContent = "<p>El mapa muestra el area de interés. Para modificar esta zona, pulse sobre el mapa y luego indique el radio del área.</p>";
                    break;
                case "log-limit":
                    $rootScope.helpContent = "<p>Configure la cantidad de veces que un mismo usuario puede realizar el autotest y el tiempo que debe transcurrir entre cada resultado registrado en la base de datos</p>";
                    break;
                case "tree-list":
                    $rootScope.helpContent = "<p>La lista muestra todos los árboles de decisión que fueron creados. Sólo un árbol por vez puede estar activo y una vez que se cargan los árboles a la base de datos ya no pueden volver a ser modificados.</p><p>Los nuevos árboles creados pueden modificarse múltiples veces antes de guardar la configuración global de este menú.</p>";
                    break;
                case "ages-plot":
                    $rootScope.helpContent = "<p>El gráfico de barras muestra un histograma de edades de los usuarios. Sólo se contabiliza la edad luego del registro del primer resultado. Los rangos de edad del histograma se crean a medida que aparecen registros correspondientes a dichos intervalos.</p>";
                    break;
                case "genders-plot":
                    $rootScope.helpContent = "<p>El gráfico circular muestra la proporción de usuarios por género. Sólo se contabiliza el género seleccionado luego del registro del primer resultado.</p>";
                    break;
                case "exitCodes-plot":
                    $rootScope.helpContent = "<p>Cada opción de cada nodo del árbol de decisiones puede tener asociado un código de salida. Cada vez que el usuario selecciona dicha opción del menú, se contabiliza el código de salida correspondiente. El significado de cada código de salida es definido por el administrador al momento de diseñar el árbol de decisiones.</p>";
                    break;
                case "paths-plot":
                    $rootScope.helpContent = "<p>El gráfico permite visualizar el árbol de decisiones actual donde el espesor de cada camino es proporcional a la cantidad de veces que un usuario pasó por ese camino.</p>";
                    break;
                case "tree-container":
                    $rootScope.helpContent = "<p>El gráfico permite visualizar el árbol de decisiones activo. Puede arrastrar los nodos, desplazar la vista o hacer zoom.</p>";
                    break;
                default:
                    $rootScope.helpContent = "No se encontro la referencia";
                    break;
            }
            $("#help-modal").modal('show');
        }
    }])
    .config(["$routeProvider", function ($routeProvider) {
        $routeProvider
            .when("/dashboard", {
                templateUrl: "views/dashboard.html",
                controller: "dashboard"
            })
            .when("/login", {
                templateUrl: "views/login.html",
                controller: "login"
            })
            .when("/", {
                templateUrl: "views/config.html",
                controller: "config"
            });
    }])
    .filter('trusted', ['$sce', function ($sce) {
        // Ver: https://stackoverflow.com/questions/39480969/angular-interpolateinterr-error-when-adding-url-from-variable
        return $sce.trustAsResourceUrl;
    }]);