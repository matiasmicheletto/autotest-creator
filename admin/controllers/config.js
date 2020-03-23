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
                if (tree[k].options[j].goto)
                    edges.push({
                        //id: k * tree.length + j,
                        from: k,
                        to: tree[k].options[j].goto,
                        smooth: {
                            type: 'curvedCW',
                            roundness: Math.random() - 0.5
                        },
                        label: $rootScope.html2Text(tree[k].options[j].text).substring(0, 10) + (tree[k].options[j].text.length > 10 ? "..." : "")
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

    $scope.newTree = function(){
        toastr.info("Pronto estará disponible esta funcionalidad");
        var newTree = {
            author: firebase.auth().currentUser.email,
            id: "T00"+($scope.tempConfig.trees.length+1),
            timestamp: Date.now(),
            tree: []
        };
        $scope.tempConfig.trees.push(newTree);
    };

    $scope.saveConfig = function(){
        $rootScope.config = angular.copy($scope.tempConfig); // Temporal durante la sesion

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