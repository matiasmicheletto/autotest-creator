app.controller("dashboard", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path('/login');
    }

    var updateAgePlot = function () { // Grafico de barras con histograma de edades

        var labels = [];
        var data = [];
        var colors = [];
        var grIncr = Math.floor(200 / Object.getOwnPropertyNames($scope.stats.ages).length); // Incremento de color de cada barra
        var gray = 5;
        for (var k in $scope.stats.ages) {
            var startAge = parseInt(k.split('_')[1]) * 10;
            var endAge = startAge + 9;
            labels.push(startAge + "-" + endAge);
            data.push($scope.stats.ages[k]);
            colors.push("rgba(" + gray + "," + gray + "," + gray + ",0.9)");
            gray += grIncr;
        }

        if ($scope.agesChart)
            $scope.agesChart.destroy();
        $scope.agesChart = new Chart(document.getElementById("age-chart"), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: "Usuarios por edad",
                    backgroundColor: colors,
                    data: data,
                }]
            },
            options: {
                maintainAspectRatio: false
            }
        });
    };

    var updateGenderPlot = function () { // Grafico de torta de porcentajes de generos
        if ($scope.genderChart)
            $scope.genderChart.destroy();
        $scope.genderChart = new Chart(document.getElementById("gender-chart"), {
            type: 'doughnut',
            data: {
                labels: ["Masculino", "Femenino", "Otro"],
                datasets: [{
                    backgroundColor: ["#333333", "#777777", "#AAAAAA"],
                    pointRadius: 0,
                    data: [$scope.stats.genders.m, $scope.stats.genders.f, $scope.stats.genders.n],
                }]
            },
            options: {
                maintainAspectRatio: true
            }
        });
    };

    var updaterResultPlot = function () { // Grafico de código de resultados
        if ($scope.exitCodeChart)
            $scope.exitCodeChart.destroy();
        $scope.exitCodeChart = new Chart(document.getElementById("exitCode-chart"), {
            type: 'bar',
            data: {
                labels: ["S001", "S002"],
                datasets: [{
                    label: "Código de resultado",
                    backgroundColor: ["#333333", "#777777"],
                    data: [120, 12],
                }]
            },
            options: {
                maintainAspectRatio: true
            }
        });
    };

    var updateTreePlot = function (index) { // Grafico de caminos recorridos
        var nodes = [];
        var edges = [];
        var tree = $rootScope.config.trees[index].tree; 
        for (var k in tree) { // Crear cada nodo del arbol
            nodes.push({
                id: k,
                value: 1,
                label: tree[k].header,
                shape:"box",
                font: { 
                    size: 12, 
                    color: "white", 
                    face: "arial"
                },
                color: "#444444"
            });
            for (var j in tree[k].options) { // Crear cada enlace
                if (tree[k].options[j].goto)
                    edges.push({
                        from: k,
                        to: tree[k].options[j].goto,
                        value: 1,
                        label: tree[k].options[j].text, 
                        font: {align: 'top'},
                        arrows: {
                            to: {
                              enabled: true,
                              type: "arrow"
                            }
                        }
                    });
            }
        }
        var data = {
            nodes: nodes,
            edges: edges
        };
        console.log(data);
        var options = {
            layout: {
                hierarchical: {
                  direction: "UD",
                  sortMethod: "directed"
                }
            },
            physics: {
                hierarchicalRepulsion: {
                    avoidOverlap: 1
                }
            },
            edges: {
                font: {
                    size: 6,
                    color: "black",
                    face: "arial"
                },
                arrows: {
                    to: {
                        scaleFactor: 1
                    }
                }
            },
            nodes: {
                shape: 'box',
                margin: 10,
                widthConstraint: {
                    maximum: 200
                }
            },
            physics: {
                enabled: false
            }
        };
        // Hacer destroy para actualizar?
        var network = new vis.Network(document.getElementById('tree-container'), data, options);
    };



    $rootScope.loading = true;
    middleware.fs.getCollection("stats")
        .then(function (snapshot) {
            $scope.stats = {}; // Objeto con contadores
            snapshot.forEach(function (document) {
                $scope.stats[document.id] = document.data();
            });

            updateAgePlot();
            updaterResultPlot();
            updateGenderPlot();

            middleware.fs.getCollection("pathStats")
                .then(function (snapshot2) {

                    $scope.pathStats = {};
                    snapshot2.forEach(function (document) {
                        $scope.pathStats[document.id] = document.data();
                    });

                    updateTreePlot(0); // El indice 0 es el mas reciente (alternar?)

                    $rootScope.loading = false;
                    $scope.$apply();
                })
                .catch(function (err2) {
                    console.log(err2);
                    $rootScope.loading = false;
                    $scope.$apply();
                });
        })
        .catch(function (err) {
            console.log(err);
            $rootScope.loading = false;
            $scope.$apply();
        });
}]);