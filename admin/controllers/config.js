app.controller("config", ['$scope', '$rootScope', function ($scope, $rootScope) {
    
    if(!$rootScope.userLogged){
        $location.path('/login');
    }
    
    // Iniciar mapa leaflet
    $scope.map = L.map('map').fitWorld();
    
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        accessToken: 'pk.eyJ1IjoibWF0aWFzbWljaGVsZXR0byIsImEiOiJjazVsa2ZtamowZHJnM2ttaXFmZGo1MDhtIn0.8iBO-J1wj34LIqq-e4Me5w'
    }).addTo($scope.map);

    $scope.map.on('click', function(e){ // Callback de click
        console.log(e.latlng);
        $scope.newLocation = e.latlng;
        $scope.newLocation.range = $scope.tempConfig.locationFilter.range;
        $scope.$apply();
        $("#location-modal").modal("show");
    });

    $scope.map.on('locationfound', function (e) { // Callback de posicion GPS actualizada
        console.log(e);
        console.log($scope.tempConfig);
    });

    // Mostrar ubicación actual
    $scope.map.locate({
        setView: true, // Forzar vista
        maxZoom: 16 // Zomm
    });

    var setupMap = function(){  // Dibujar area de operacion
        var current_location = { // Crear marcador
            marker: L.marker($scope.tempConfig.locationFilter),
            radius: L.circle($scope.tempConfig.locationFilter, $scope.tempConfig.locationFilter.range*1000) // Rango en metros
        };

        if($scope.markerGroup) $scope.markerGroup.clearLayers(); // Un marcador a la vez
        
        $scope.markerGroup = L.layerGroup().addTo($scope.map);

        // Agregar marcador al mapa con su circulo de posicion estimada
        current_location.marker.addTo($scope.markerGroup).bindPopup("Area de acceso a la aplicación");
        current_location.radius.addTo($scope.markerGroup);
        current_location.marker.openPopup();
    };

    $scope.updateLocationFilter = function(){ // Callback para configurar nueva ubicacion
        $scope.tempConfig.locationFilter = angular.copy($scope.newLocation);
        setupMap();
        toastr.success("Espacio de operación actualizado");
        $("#location-modal").modal("hide");
    };


    var updateTreePlot = function () { // Grafico de caminos recorridos
        
        var treeData = $scope.tempConfig.trees.find(function(el){return el.active});
        var tree = treeData.tree;
        
        var nodes = [];
        var edges = [];

        var exitCodes = []; // Lista de codigos de salida para mostrar en el grafo

        for (var k in tree) { // Crear cada nodo del arbol
            var nodeTitle = tree[k].header.substring(0, 15)+"-\n"+tree[k].header.substring(15, 30)+"-\n"+tree[k].header.substring(30, 50);
            nodes.push({
                id: k,
                value: 1,
                label: "["+k+"] -- "+ $rootScope.html2Text(nodeTitle)+"...",
                shape:"box",
                font: { 
                    size: 12, 
                    color: "white", 
                    face: "arial"
                },
                color: "#444444"
            });
            for (var j in tree[k].options) { // Crear cada enlace
                if (tree[k].options[j].goto != -1){
                    edges.push({
                        from: k,
                        to: tree[k].options[j].goto,
                        smooth: {
                            type: 'curvedCW',
                            roundness: Math.random() - 0.5
                        },
                        label: $rootScope.html2Text(tree[k].options[j].text).substring(0, 10) + (tree[k].options[j].text.length > 10 ? "..." : "")
                    });
                }else{
                    if(tree[k].options[j].exitCode){
                        if(!exitCodes.includes(tree[k].options[j].exitCode)){
                            exitCodes.push(tree[k].options[j].exitCode); // Agregar a la lista
                            nodes.push({ // Crear un nodo para mostrar el punto de finalizacion
                                id: tree[k].options[j].exitCode,
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
                            label: "Cód. de salida"
                        });
                    }
                }
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
            physics: false,
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
        // Hacer destroy para actualizar?
        var network = new vis.Network(document.getElementById('tree-container'), data, options);
    };

    $scope.newTree = function(){ // Crear un nuevo arbol vacio
        toastr.success("Nuevo arbol creado");
        var newTree = {
            author: firebase.auth().currentUser.email,
            id: "T00"+($scope.tempConfig.trees.length+1),
            timestamp: Date.now(),
            editable: true, // Antes de cargarse a la db, puede ser editado
            tree: []
        };
        $scope.tempConfig.trees.push(newTree);
    };

    $scope.setActiveTree = function(index){ // Configurar arbol de la lista como activo
        for(var k in $scope.tempConfig.trees){
            if(k == index)
                $scope.tempConfig.trees[k].active = true;
            else
                $scope.tempConfig.trees[k].active = false;
        }
        updateTreePlot();
    };

    $scope.editTree = function(index){ // Editar un arbol recientemente creado
        $scope.editingTree = angular.copy($scope.tempConfig.trees[index]);
        console.log($scope.editingTree);
        $("#tree-edit-modal").modal("show");
    };

    $scope.saveConfig = function(){ // Cuando el admin confirma aplicar la configuracion actual a la base de datos, se sobre escribe toda la configuracion

        // Deshabilitar edicion de todos los arboles
        for(var k in $scope.tempConfig.trees){
            delete $scope.tempConfig.trees[k].editable;
        }
        $rootScope.config = angular.copy($scope.tempConfig);
        $("#confirm-modal").modal("hide");

        // TODO: cargar a firebase
        console.log("Actualizar config");
        console.log($rootScope.config);
    };

    $scope.resetConfig = function(){ // Reestablecer el modelo que se muestra en la vista al de la base de datos
        $scope.tempConfig = angular.copy($rootScope.config);
        $scope.elapsedHours = $scope.tempConfig.logLimit.elapsed/3600000; // Convertir de milisegundos a horas
        setupMap();
        updateTreePlot();
    };

    $scope.updateElapsed = function(){ // Callback de cambios en el input del limitador de usos
        $scope.tempConfig.logLimit.elapsed = $scope.elapsedHours*3600000; // Convertir de horas a milisegundos
    };
    
    $scope.resetConfig();
}]);