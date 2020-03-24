app.controller("dashboard", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path('/login');
    }

    var updateAgePlot = function () { // Grafico de barras con histograma de edades

        var labels = [];
        var data = [];
        var colors = [];
        var grIncr = Math.floor(200 / Object.getOwnPropertyNames($rootScope.stats.ages).length); // Incremento de color de cada barra
        var gray = 5;
        for (var k in $rootScope.stats.ages) {
            var startAge = parseInt(k.split('_')[1]) * 10;
            var endAge = startAge + 9;
            labels.push(startAge + "-" + endAge);
            data.push($rootScope.stats.ages[k]);
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
                maintainAspectRatio: false,
                scales: { // Para comenzar en 0
                    yAxes: [{
                        display: true,
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
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
                    data: [$rootScope.stats.genders.m, $rootScope.stats.genders.f, $rootScope.stats.genders.n],
                }]
            },
            options: {
                maintainAspectRatio: true
            }
        });
    };

    var updaterResultPlot = function () { // Grafico de código de resultados
        
        var labels = [];
        var data = [];
        var colors = [];
        var grIncr = Math.floor(200 / Object.getOwnPropertyNames($rootScope.stats.exitCodes).length); // Incremento de color de cada barra
        var gray = 5;
        for (var k in $rootScope.stats.exitCodes) {
            labels.push(k);
            data.push($rootScope.stats.exitCodes[k]);
            colors.push("rgba(" + gray + "," + gray + "," + gray + ",0.9)");
            gray += grIncr;
        }

        if ($scope.exitCodeChart)
            $scope.exitCodeChart.destroy();
        $scope.exitCodeChart = new Chart(document.getElementById("exitCode-chart"), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: "Código de resultado",
                    backgroundColor: colors,
                    data: data,
                }]
            },
            options: {
                maintainAspectRatio: true,
                scales: { // Comenzar en 0
                    yAxes: [{
                        display: true,
                        ticks: {
                            beginAtZero: true 
                        }
                    }]
                }
            }
        });
    };

    var updatePathsPlot = function () { // Grafico de sankey de interacciones de usuarios

        // Determinar modelo activo
        var treeData = $rootScope.config.trees.find(function (el) {
            return el.active
        });
        var tree = treeData.tree;

        //console.log($rootScope.pathStats[treeData.id]);
        var weights = {};
        var maxWeight = 0; // Para normalizar los valores
        for (var k in $rootScope.pathStats[treeData.id]) {
            if (!weights[k.split('_')[1]])
                weights[k.split('_')[1]] = {};
            weights[k.split('_')[1]][k.split('_')[2]] = $rootScope.pathStats[treeData.id][k];
            if($rootScope.pathStats[treeData.id][k] > maxWeight)
                maxWeight = $rootScope.pathStats[treeData.id][k];
        }
        console.log(weights);

        var nodes = [];
        var edges = [];

        var exitCodes = []; // Lista de codigos de salida para mostrar en el grafo

        for (var k in tree) { // Crear cada nodo del arbol
            var nodeTitle = tree[k].header.substring(0, 15)+"-\n"+tree[k].header.substring(15, 30)+"-\n"+tree[k].header.substring(30, 50);
            nodes.push({
                id: k,
                value: 1,
                label: "[" + k + "] -- " + $rootScope.html2Text(nodeTitle) + "...",
                shape: "box",
                font: {
                    size: 12,
                    color: "white",
                    face: "arial"
                },
                color: "#444444"
            });
            for (var j in tree[k].options) { // Crear cada enlace
                if (tree[k].options[j].goto != -1 && tree[k].options[j].goto != undefined) {
                    edges.push({
                        from: k,
                        to: tree[k].options[j].goto,
                        smooth: {
                            type: 'curvedCW',
                            roundness: Math.random() - 0.5
                        },
                        value: Math.round(weights[k][tree[k].options[j].goto]/maxWeight*10) || 1,
                        label: $rootScope.html2Text(tree[k].options[j].text).substring(0, 10) + 
                            (tree[k].options[j].text.length > 10 ? "..." : "") + "\n(" + weights[k][tree[k].options[j].goto] + ")"
                    });
                }else{
                    if(tree[k].options[j].exitCode){
                        if(!exitCodes.includes(tree[k].options[j].exitCode)){
                            exitCodes.push(tree[k].options[j].exitCode); // Agregar a la lista
                            nodes.push({ // Crear un nodo para mostrar el punto de finalizacion
                                id: tree[k].options[j].exitCode,
                                value: 1,
                                label: tree[k].options[j].exitCode || "S/C",
                                shape: "circle",
                                font: {
                                    size: 12,
                                    color: "white",
                                    face: "arial"
                                },
                                color: "#AAAAAA"
                            });
                        }
                        // Crear el enlace al nodo de salida
                        edges.push({
                            from: k,
                            to: tree[k].options[j].exitCode,
                            smooth: {
                                type: 'curvedCW',
                                roundness: Math.random() - 0.5
                            },
                            value: 1,
                            label: "Cód. de salida"
                        });
                    }
                }
            }
        }
        var data = {
            nodes: new vis.DataSet(nodes),
            edges: new vis.DataSet(edges)
        };
        console.log(data);
        var options = {
            layout: {
                hierarchical: {
                    direction: "UD",
                    sortMethod: "directed"
                }
            },
            physics:false,
            edges: {
                font: {
                    size: 10,
                    color: "black",
                    face: "arial",
                    align: 'top'
                },
                arrows: {
                    to: {
                        enabled: true,
                        scaleFactor: 1
                    }
                }
            },
            nodes: {
                shape: 'box'
            }
        };

        var network = new vis.Network(document.getElementById('paths-container'), data, options);
    };


    $scope.updateStats = function () { // Las stats se descargan al acceder a este controller por unica vez durante el uso de la app
        $rootScope.loading = true;
        middleware.fs.getCollection("stats")
            .then(function (snapshot) {
                $rootScope.stats = {}; // Objeto con contadores
                snapshot.forEach(function (document) {
                    $rootScope.stats[document.id] = document.data();
                });

                updateAgePlot();
                updaterResultPlot();
                updateGenderPlot();

                middleware.fs.getCollection("pathStats")
                    .then(function (snapshot2) {
                        $rootScope.pathStats = {};
                        snapshot2.forEach(function (document) {
                            $rootScope.pathStats[document.id] = document.data();
                        });

                        updatePathsPlot();

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
    };


    if (!$rootScope.stats) // Descargar la 1ra vez
        $scope.updateStats();
    else { // Sino, directamente actualizar graficos
        updateAgePlot();
        updaterResultPlot();
        updateGenderPlot();
        updatePathsPlot();
    }
}]);