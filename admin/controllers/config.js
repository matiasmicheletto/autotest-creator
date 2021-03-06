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
        accessToken: 'pk.eyJ1IjoibWF0aWFzbWljaGVsZXR0byIsImEiOiJjazh2b3A4eGswbnZqM2ludTdhbjBuYnZ4In0.Nwsu6goxfwM_8AhKW-ZPew'
    }).addTo($scope.map);

    $scope.defaultFilterRange = 50; // Valor por defecto
    $scope.map.on('click', function(e){ // Callback de click
        console.log(e.latlng);
        $scope.newLocation = e.latlng;
        $scope.newLocation.range = $scope.defaultFilterRange; // Valor por defecto
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
        if(!$scope.markerGroup) // Grupo de marcadores de los filtros
            $scope.markerGroup = L.layerGroup().addTo($scope.map);

        $scope.markerGroup.clearLayers(); // Limpiar mapa (se redibuja cada vez)

        for(var k in $scope.tempConfig.locationFilters){
        
            var new_location = { // Crear marcador
                marker: L.marker($scope.tempConfig.locationFilters[k]),
                radius: L.circle($scope.tempConfig.locationFilters[k], $scope.tempConfig.locationFilters[k].range*1000) // Rango en metros
            };

            $scope.defaultFilterRange = $scope.tempConfig.locationFilters[k].range; // Por defecto dejar el valor del ultimo agregado

            // Agregar marcador al mapa con su circulo de posicion estimada
            new_location.marker.addTo($scope.markerGroup).bindPopup("Area de acceso a la aplicación");
            new_location.radius.addTo($scope.markerGroup);
            new_location.marker.openPopup();
        }
    };

    $scope.addLocationFilter = function(){ // Callback para agregar nueva ubicacion a la lista de filtros
        if(!$scope.tempConfig.locationFilters) // Caso de lista vacia
            $scope.tempConfig.locationFilters = [];
        $scope.tempConfig.locationFilters.push($scope.newLocation);
        setupMap();
        toastr.success("Espacio de operación actualizado");
        $("#location-modal").modal("hide");
    };

    $scope.clearLocationFilters = function(){ // Borrar todos los filtros de ubicacion
        $scope.tempConfig.locationFilters = [];
        setupMap();
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
            for (var j in tree[k].options) { // Crear enlaces de cada opcion
                switch(tree[k].options[j].type){
                    case 'goto': // Solo un enlace al siguiente nodo
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
                    case 'link': // Enlace a un circulo que representa el link
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
                    case 'decision': // Enlaces a cada una de las salidas
                        const l = tree[k].options[j].decision.split(',');
                        var rndss = -0.5; const rndIncr = 1/l.length; // Para roundess incremental
                        var padding = Math.log(l.length) / Math.log(2); // Cantidad de digitos codigo binario de seleccion
                        for(var ind = 0; ind < l.length; ind++){ // Para cada posible seleccion
                            edges.push({
                                from: k,
                                to: parseInt(l[ind]),
                                smooth: {
                                    type: 'curvedCW',
                                    roundness: rndss
                                },
                                label: (ind).toString(2).padStart( padding,"0") // (codigo binario)
                            });
                            rndss += rndIncr;
                        }
                        break;
                    case 'exit': // Enlace a circulo rojo con codigo de finalizacion
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
        var newTree = {
            author: firebase.auth().currentUser.email,
            id: "T00"+($scope.tempConfig.trees.length+1),
            timestamp: Date.now(),
            editable: true, // Antes de cargarse a la db como activo, puede ser editado
            validated: false, // No puede cargarse a la db como activo si no esta validado
            tree: [{ // Crearlo con un solo nodo
                header:"",
                content:"",
                options:[] // Sin opciones
            }]
        };
        $scope.tempConfig.trees.push(newTree);
        toastr.success("Nuevo arbol creado");
    };

    $scope.copyTree = function(index){ // Crear un nuevo arbol a partir de otro
        var newTree = {
            author: firebase.auth().currentUser.email,
            id: "T00"+($scope.tempConfig.trees.length+1),
            timestamp: Date.now(),
            editable: true, // Antes de cargarse a la db como activo, puede ser editado
            validated: false, // No puede cargarse a la db como activo si no esta validado
            tree: angular.copy($scope.tempConfig.trees[index].tree)
        };
        $scope.tempConfig.trees.push(newTree);
        toastr.success("Árbol duplicado");
    };

    $scope.deleteTree = function(index){ // Eliminar arbol
        $scope.tempConfig.trees[index].deleted = true; // Se marca para eliminar luego de la db
        toastr.info("Árbol eliminado");  
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
        $scope.tempConfig.trees[$scope.editingIndex].validated = false; // Indicar que no esta validado aun
        $("#tree-edit-modal").modal("show");
    };

    $scope.cancelEdition = function(){ // Salir del editor. El arbol editado no se verifica por lo que pueden quedar lazos o sin condicion de salida.
        toastr.info("Arbol no verificado! No guarde la configuración actual.");
        $("#tree-edit-modal").modal("hide");
    };

    $scope.validateTree = function(){ // Verifica el arbol creado: busca lazos infinitos y reconfigura modelo

        var tree = $scope.tempConfig.trees[$scope.editingIndex].tree;
        
        // Validar menues con selectores
        for(var k in tree){
            var toggleCntr = 0; // Contador de selectores por nodo
            var exprs = []; // Lista de expresiones por nodo
            for(var j in tree[k].options){ // Contar selectores y guardar expresiones
                if(tree[k].options[j].type=="toggle")
                    toggleCntr++;
                if(tree[k].options[j].type=="decision"){
                    if(!tree[k].options[j].decision){ // Una de las expresiones no esta definida
                        toastr.error("Falta definir expresiones en el nodo "+k);
                        return;        
                    }
                    exprs.push(tree[k].options[j].decision);
                }
            }
            //
            if(toggleCntr > 0 && exprs.length == 0){ // Si hay selectores pero no hay expresiones
                toastr.error("No hay opciones de decisión para los selectores del nodo "+k);
                return;
            }
            for(var j in exprs){
                var exprLen = exprs[j].split(",").length;
                if(exprLen != Math.pow(2,toggleCntr)){
                    toastr.error("El nodo "+k+" tiene "+toggleCntr+" selectores, pero la lista de indices tiene "+exprLen+" indices");
                    return;
                }
            }
        }

        // Evaluar modelo para buscar lazos infinitos o nodos sin salida
        var goToNode = function(index){ // Recorrer todo el arbol
            var exit = false; // Indica si se encuentra opcion de salida en el nodo actual
            for(var k in tree[index].options){ // Para cada enlace del nodo actual
                if(tree[index].options[k].type=="goto"){ // Enlace a otro nodo
                    exit = true; // Si puede saltar a otro nodo, hay salida
                    var status = goToNode(tree[index].options[k].goto); // Evaluar ese nodo
                    if(status != "ok") // Si ya se detecto error
                        return status; // Retornar por backtrack
                }
                if(tree[index].options[k].type=="decision"){
                    var nodeList = tree[index].options[k].decision.split(','); // Lista de enlaces
                    exit = true; // Suponer que puede ir a otro nodo
                    for(var j in nodeList){
                        var status = goToNode(nodeList[j]); // Evaluar ese nodo
                        if(status != "ok") // Si ya se detecto error
                            return status; // Retornar por backtrack       
                    }
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
                $scope.tempConfig.trees[$scope.editingIndex].validated = true; // Habilitar activacion
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
                if ($scope.tempConfig.trees[$scope.activeIndex].tree[index]){ // Control
                    $scope.current = $scope.tempConfig.trees[$scope.activeIndex].tree[index];
                }
            }
        };

        $scope.toggleButton = function(index){ // Alterna estado de selectores
            if(!$scope.current.options[index].checked) // La primera vez es undefined
                $scope.current.options[index].checked = true;
            else
                $scope.current.options[index].checked = false;
        };

        $scope.evalDecision = function(expr){ // Evalua los toggle seleccionados y decide a cual nodo ir

            // Convertir expresion logica en array (si, cada vez)
            var gotoArray = expr.split(',');
            for(var k in gotoArray)
                gotoArray[k] = parseInt(gotoArray[k]);

            // Generar valor binario de las opciones elegidas
            var binArray = "";
            for(var k in $scope.current.options)
                if($scope.current.options[k].type=="toggle")
                    binArray = binArray+($scope.current.options[k].checked ? "1":"0");

            var index = parseInt(binArray,2); // Convertir a decimal

            $scope.loadMenu(gotoArray[index]); // Ir a la vista correspondiente
        };

        $scope.exit = function(code){ // Finalizacion del test
            toastr.info("Codigo de finalización: "+code);
            $("#app-test-modal").modal("hide");
        };

        $("#app-test-modal").modal("show");
    };

    $scope.saveConfig = function(){ // Cuando el admin confirma aplicar la configuracion actual a la base de datos, se sobre escribe toda la configuracion

        // Verificar arboles validados y deshabilitar edicion de los arboles que se publican como activos
        var forUpdate = {}; // Lista de arboles a actualizar estado
        var forPush = []; // Lista de arboles a subir
        var indexList = []; // Lista de indices del arreglo tempConfig.trees de los arboles que se van a subir
        for(var k in $scope.tempConfig.trees){
            if($scope.tempConfig.trees[k].active){ // Si se selecciona un arbol como activo
                if(!$scope.tempConfig.trees[k].validated){ // Intenta activar un arbol no validado
                    toastr.error("El modelo de decisiones que intenta activar no fue validado. Edite el árbol y seleccione 'Validar'");
                    $("#confirm-modal").modal("hide");
                    return;
                }
                $scope.tempConfig.trees[k].editable = false; // Deshabilitar la edicion permanentemente
            }
            if($scope.tempConfig.trees[k].key && !$scope.tempConfig.trees[k].deleted){ // Los que se borraron no deben actualizarse
                forUpdate["decisionTrees/"+$scope.tempConfig.trees[k].key+"/active"] = $scope.tempConfig.trees[k].active;
            }else{
                forPush.push($scope.tempConfig.trees[k]);
                indexList.push(k);
            }
        }

        // La eliminacion de arboles se realiza luego del checkeo anterior
        var deleteJob = [];
        for(var k in $scope.tempConfig.trees){
            if($scope.tempConfig.trees[k].deleted && $scope.tempConfig.trees[k].key){ // Si es un arbol eliminado que estaba guardado
                deleteJob.push(middleware.db.set(null,"decisionTrees/"+$scope.tempConfig.trees[k].key));
            }
        }

        // Actualizar configuracion de filtros
        forUpdate["config/locationFilters"] = $scope.tempConfig.locationFilters;
        forUpdate["config/logLimit"] = $scope.tempConfig.logLimit;
        
        $rootScope.loading = true;
        Promise.all(deleteJob) // Eliminar arboles si habia marcados
        .then(function(){
            middleware.db.update(forUpdate) // Sincronizar estado de los arboles que estaban en db y configuracion de filtros
                .then(function(){
                    middleware.db.pushMultiple(forPush,"decisionTrees") // Subir los nuevos arboles creados
                    .then(function(res){
                        var job = []; // Promesas
                        for(var k in res){ // Por cada nuevo arbol creado
                            $scope.tempConfig.trees[indexList[k]].key = res[k].key; // Poner las claves a los arboles por si vuelve a subir cambios
                            job.push(middleware.fs.set({},"pathStats",$scope.tempConfig.trees[indexList[k]].id)); // Crear document para los paths del nuevo arbol
                        }
                        Promise.all(job)
                        .then(function(){
                            $rootScope.config = angular.copy($scope.tempConfig);
                            $rootScope.loading = false;
                            $scope.$apply();
                            toastr.success("La configuración actual fue sincronizada con la base de datos.")
                            $("#confirm-modal").modal("hide");            
                        })
                        .catch(function(err4){
                            console.log(err4);
                            $rootScope.loading = false;
                            $scope.$apply();
                            toastr.error("Ocurrió un error al crear indicadores del nuevo árbol creado.");
                        });
                    })
                    .catch(function(err3){
                        console.log(err3);
                        $rootScope.loading = false;
                        $scope.$apply();
                        toastr.error("Ocurrió un error al sincronizar los árboles creados. Vuelva a intentarlo más tarde.");
                    });
                })
                .catch(function(err2){
                    console.log(err2);
                    $rootScope.loading = false;
                    $scope.$apply();
                    toastr.error("Ocurrió un error al sincronizar árboles activos. Vuelva a intentarlo más tarde.");
                });
            })
        .catch(function(err){
            console.log(err);
            $rootScope.loading = false;
            $scope.$apply();
            toastr.error("Ocurrió un error al eliminar arboles creados");
        });
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