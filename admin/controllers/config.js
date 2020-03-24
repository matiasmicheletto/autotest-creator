app.controller("config", ['$scope', '$rootScope', function ($scope, $rootScope) {
    
    if(!$rootScope.userLogged){
        $location.path('/login');
    }
    
    // Iniciar mapa leaflet
    $scope.map = L.map('map',{
        center: [$rootScope.config.locationFilter.lat, $rootScope.config.locationFilter.lng],
        zoom: 8,
    });
    
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
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

    /*
    $scope.map.on('locationfound', function (e) { // Callback de posicion GPS actualizada
        console.log(e);
    });
    

    // Mostrar ubicación actual
    $scope.map.locate({
        setView: true, // Forzar vista
        maxZoom: 16 // Zoom
    });
    */

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
                color: "#444444" // Gris oscuro
            });
            for (var j in tree[k].options) { // Crear cada enlace
                switch(tree[k].options[j].type){
                    case 'goto':
                        edges.push({
                            from: k,
                            to: tree[k].options[j].goto,
                            smooth: {
                                type: 'curvedCW',
                                roundness: Math.random() - 0.5
                            },
                            label: $rootScope.html2Text(tree[k].options[j].text).substring(0, 10) + (tree[k].options[j].text.length > 10 ? "..." : "")
                        });
                        break;
                    case 'link':
                        var newId = $rootScope.generateID(20); // Identificador unico
                        nodes.push({ // Crear un nodo para mostrar el enlace externo
                            id: newId,
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
                            label: "Enlace ext."
                        });
                        break;
                    case 'exit':
                        var newId = $rootScope.generateID(20); // Identificador unico
                        nodes.push({ // Crear un nodo para mostrar el punto de finalizacion
                            id: newId,
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
                            label: "Cód. de salida"
                        });
                        break;
                    default:
                        break;
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
            tree: [{ // Crearlo con un solo nodo
                header:"",
                content:"",
                options:[] // Sin opciones
            }]
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
        $scope.editingIndex = index; // Tomar indice para mostrar arbol en la vista
        $("#tree-edit-modal").modal("show");
    };

    $scope.validateTree = function(){ // Verifica el arbol creado: busca lazos infinitos y reconfigura modelo

        // Evaluar modelo para buscar lazos infinitos o nodos sin salida
        var tree = $scope.tempConfig.trees[$scope.editingIndex].tree;

        var goToNode = function(index){ // Recorrer todo el arbol
            var exit = false; // Indica si se encuentra opcion de salida en el nodo actual
            for(var k in tree[index].options){ // Para cada enlace del nodo actual
                if(tree[index].options[k].type=="goto"){ // Enlace a nodo
                    exit = true; // Si puede saltar a otro nodo, hay salida
                    var status = goToNode(tree[index].options[k].goto); // Evaluar ese nodo
                    if(status != "ok") // Si ya se detecto error
                        return status; // Retornar por backtrack
                }
                if(tree[index].options[k].type=="exit" && tree[index].options[k].exitCode) // Opcion de salida
                    exit = true; // Este nodo tiene al menos una condicion de salida
            }
            if(!exit) return "exit"; // Si ningun nodo permite salir o pasar a otro nodo, es arbol sin salida
            return "ok";
        }
    
        var status;
        try{ // Si hay lazos sin salida, se llena el stack
            status = goToNode(0); // Iniciar el recorrido por el nodo 0
        }catch(e){
            console.log(e.message);
            status = "loop";
        }
    
        switch(status){
            case "exit":
                console.log("Se detectaron nodos sin salida.");
                toastr.error("El arbol tiene nodos sin salida");
                break;
            case "loop":
                console.log("Se detectaron lazos infinitos.");
                toastr.error("El arbol tiene lazos infinitos o hay nodos mal referenciados");
                break;
            case "ok":
                console.log("Arbol correcto");
                toastr.success("Arbol correcto");
                $("#tree-edit-modal").modal("hide");
                break;
            default:
                break;
        }
        updateTreePlot(); // Actualizar la visualizacion
    };

    $scope.testInDevice = function(){ // Iniciar dispositivo para probar modelo activo

        $scope.activeIndex = $scope.tempConfig.trees.findIndex(function(el){return el.active});
        $scope.current = $scope.tempConfig.trees[$scope.activeIndex].tree[0];

        $scope.loadMenu = function (index) { // Callback de botones con enlace a sgte nodo
            if(index > 0){ // Pasar a la siguiente vista
                if ($scope.tempConfig.trees[$scope.activeIndex].tree[index]) // Control
                    $scope.current = $scope.tempConfig.trees[$scope.activeIndex].tree[index];
            }
        };

        $scope.exit = function(code){ // Finalizacion del test
            toastr.info("Codigo de finalización: "+code);
            $("#app-test-modal").modal("hide");
        };
        
        $("#app-test-modal").modal("show");
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