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

        // Crear objeto de pesos de enlaces
        var weights = [];
        var maxWeight = 0; // Para normalizar los valores

        for (var k in $rootScope.pathStats[treeData.id]) { // Para cada string que codifica el camino computado
            var p = k.split('_'); // ["P", desde, hacia, camino]
            var from = parseInt(p[1]);
            var to = parseInt(p[2]);
            var index = parseInt(p[3]);
            if(!weights[from]) weights[from] = []; // Crear array de nodos destino vacio
            if(!weights[from][to]) weights[from][to] = []; // Crear array de caminos para llegar a destino
            weights[from][to][index] = $rootScope.pathStats[treeData.id][k]; // Asignar peso del enlace
            if($rootScope.pathStats[treeData.id][k] > maxWeight) // Calcular maximo
                maxWeight = $rootScope.pathStats[treeData.id][k];
        }
        console.log(weights);

        if(maxWeight == 0) maxWeight = 1;

        var nodes = [];
        var edges = [];

        for (var k = 0; k < tree.length; k++) { // Para cada nodo del arbol, crear nodo de grafo
            var nodeTitle = tree[k].header.substring(0, 15)+"-\n"+tree[k].header.substring(15, 30)+"-\n"+tree[k].header.substring(30, 50);
            nodes.push({
                id: k,
                value: 1,
                label: "[" + k + "] -- " + $rootScope.html2Text(nodeTitle) + "...", // Titulo recortado
                shape: "box",
                font: {
                    size: 12,
                    color: "white",
                    face: "arial"
                },
                color: "#444444" // Gris oscuro
            });
            for (var j = 0; j < tree[k].options.length; j++) { // Para cada enlace (los enlaces externos no se grafican)
                switch(tree[k].options[j].type){
                    case "goto": // Enlace a otro nodo
                        var w = 0; // Peso del enlace defecto
                        var lbl = $rootScope.html2Text(tree[k].options[j].text).substring(0, 10) + 
                                (tree[k].options[j].text.length > 10 ? "..." : "") + "\n(0)"; // Etiqueta defecto

                        if(weights[k]){
                            if(weights[k][tree[k].options[j].goto]){
                                if(weights[k][tree[k].options[j].goto][j]){ // Si hay camino computado, incrementar value
                                    w = weights[k][tree[k].options[j].goto][j];
                                    lbl = $rootScope.html2Text(tree[k].options[j].text).substring(0, 10) + 
                                        (tree[k].options[j].text.length > 10 ? "..." : "") + "\n(" + w + ")";
                                }
                            }
                        }

                        edges.push({
                            from: k,
                            to: tree[k].options[j].goto,
                            smooth: {
                                type: 'curvedCW',
                                roundness: Math.random() - 0.5
                            },
                            value: Math.round(w/maxWeight*10),
                            label: lbl
                        });
                        break;
                    case "link": // Enlace externo
                        var newId = $rootScope.generateID(20); // Identificador unico
                        nodes.push({ // Crear un nodo para mostrar el punto de finalizacion
                            id: newId,
                            value: 1,
                            label: tree[k].options[j].text.substring(0, 8)+"..." || "S/L",
                            shape: "circle",
                            font: {
                                size: 12,
                                color: "white",
                                face: "arial"
                            },
                            color: "#AAAAAA" // Gris claro
                        });
                        edges.push({ // Crear el enlace al nodo de salida
                            from: k,
                            to: newId,
                            smooth: {
                                type: 'curvedCW',
                                roundness: Math.random() - 0.5
                            },
                            value: 0,
                            label: "Enlace ext."
                        });
                        break;
                    case 'decision': // Enlaces a cada una de las salidas
                        const l = tree[k].options[j].decision.split(','); // Lista de nodos destino
                        var rndss = -0.5; const rndIncr = 1/l.length; // Para roundess incremental
                        var padd = Math.log(l.length) / Math.log(2); // Cantidad de digitos codigo binario de seleccion
                        for(var ind = 0; ind < l.length; ind++){ // Para cada nodo destino
                            
                            var w = 0; // Peso del enlace defecto
                            var lbl = (parseInt(ind)).toString(2).padStart(padd, "0") + "\n(0)"; // Etiqueta defecto
                            
                            if(weights[k]){
                                if(weights[k][parseInt(l[ind])]){
                                    if(weights[k][parseInt(l[ind])][ind]){ // Si hay camino computado, incrementar value
                                        w = weights[k][parseInt(l[ind])][ind];
                                        lbl = (parseInt(ind)).toString(2).padStart(padd, "0") + "\n(" + w + ")";
                                    }
                                }
                            }
                            
                            edges.push({
                                from: k,
                                to: parseInt(l[ind]),
                                smooth: {
                                    type: 'curvedCW',
                                    roundness: rndss
                                },
                                value: Math.round(w/maxWeight*10),
                                label: lbl
                            });
                            rndss += rndIncr;
                        }
                        break;
                    case "exit": // Salida y reporte
                        var newId = $rootScope.generateID(20); // Identificador unico
                        nodes.push({ // Crear un nodo para mostrar el punto de finalizacion
                            id: newId,
                            value: 1,
                            label: tree[k].options[j].exitCode || "S/C",
                            shape: "circle",
                            font: {
                                size: 12,
                                color: "white",
                                face: "arial"
                            },
                            color: "#AA0000" // Rojo oscuro
                        });
                        edges.push({ // Crear el enlace al nodo de salida
                            from: k,
                            to: newId,
                            smooth: {
                                type: 'curvedCW',
                                roundness: Math.random() - 0.5
                            },
                            value: 0,
                            label: "Cód. de salida"
                        });
                        break;
                    default:
                        break;
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

    $scope.clearStats = function(){ // Guardar contadores en realtime y reiniciar estadisticas

        $rootScope.loading = true;
        middleware.fs.getCollection("stats")
            .then(function (snapshot) {
                $rootScope.stats = {}; // Objeto con contadores
                snapshot.forEach(function (document) {
                    $rootScope.stats[document.id] = document.data();
                });
                middleware.fs.getCollection("pathStats")
                    .then(function (snapshot2) {
                        $rootScope.pathStats = {};
                        snapshot2.forEach(function (document) {
                            $rootScope.pathStats[document.id] = document.data();
                        });

                        var statsBackups = { // Objeto a guardar en realtimeDB
                            name: $scope.backupName,
                            stats: $rootScope.stats,
                            pathStats: $rootScope.pathStats,
                            timestamp: Date.now()
                        };

                        var job = [];
                        
                        // Actualizar datos en realtime
                        job.push(middleware.db.push(statsBackups,"statsBackups"));

                        // Reiniciar contadores de datos
                        for(var k in $rootScope.stats){
                            for(var j in $rootScope.stats[k]){
                                $rootScope.stats[k][j] = 0;
                            }
                            job.push(middleware.fs.update($rootScope.stats[k], "stats", k));
                        }

                        // Reiniciar contadores de paths
                        for(var k in $rootScope.pathStats){
                            for(var j in $rootScope.pathStats[k]){
                                $rootScope.pathStats[k][j] = 0;
                            }
                            job.push(middleware.fs.update($rootScope.pathStats[k], "pathStats", k));
                        }

                        Promise.all(job)
                        .then(function(){
                            updatePathsPlot();
                            updateAgePlot();
                            updaterResultPlot();
                            updateGenderPlot();
                            $rootScope.loading = false;
                            $scope.$apply();
                            $("#save-modal").modal("hide");
                        })
                        .catch(function(err3){
                            console.log(err3);
                            $rootScope.loading = false;
                            $scope.$apply();
                        });

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

    $scope.listBckps = function(){ // Listar los backups guardados de contadores
        $rootScope.loading = true;

        middleware.db.get("statsBackups")
        .then(function(snapshot){
            $scope.backupList = []; // Lista de backups
            for(var k in snapshot){
                var bk = snapshot[k];
                bk.key = k;
                $scope.backupList.push(bk);
            }

            $rootScope.loading = false;
            $("#load-stats-modal").modal("show");
            $scope.$apply();
        })
        .catch(function(err){
            console.log(err);
            $rootScope.loading = false;
            $scope.$apply();
        });
    };

    $scope.viewBackup = function(key){ // Cargar backup (sin sobreescribir)
        var index = $scope.backupList.findIndex(function(el){return el.key == key});
        
        $rootScope.stats = angular.copy($scope.backupList[index].stats);
        $rootScope.pathStats = angular.copy($scope.backupList[index].pathStats);

        updateAgePlot();
        updaterResultPlot();
        updateGenderPlot();
        updatePathsPlot();

        $("#load-stats-modal").modal("hide");
    };

    $scope.restoreBackup = function(key){ // Restaurar contadores (sobreescribiendo contadores activos)
        
        $rootScope.loading = true;
        
        var index = $scope.backupList.findIndex(function(el){return el.key == key});

        var job = [];
        for(var k in $scope.backupList[index].stats)
            job.push(middleware.fs.update($scope.backupList[index].stats[k], "stats", k));
        
        for(var k in $scope.backupList[index].pathStats)
            job.push(middleware.fs.update($scope.backupList[index].pathStats[k], "pathStats", k));

        Promise.all(job)
        .then(function(){
            $rootScope.stats = angular.copy($scope.backupList[index].stats);
            $rootScope.pathStats = angular.copy($scope.backupList[index].pathStats);
            $rootScope.loading = false;
            $scope.$apply();
            $("#load-stats-modal").modal("hide");
            updateAgePlot();
            updaterResultPlot();
            updateGenderPlot();
            updatePathsPlot();
        })
        .catch(function(err){
            console.log(err);
            $rootScope.loading = false;
            $scope.$apply();
        });
        
    };

    $scope.deleteBackup = function(key){ // Eliminar backup
        var index = $scope.backupList.findIndex(function(el){return el.key == key});

        // TODO
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