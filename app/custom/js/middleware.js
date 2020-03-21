window.middleware = (function () {

    var firebaseConfig = { // Configuracion firebase
        apiKey: "AIzaSyDcBhhiu-dQXWaGBLcTEtnz8HPnelfXuA4",
        authDomain: "covid19-autotest.firebaseapp.com",
        databaseURL: "https://covid19-autotest.firebaseio.com",
        projectId: "covid19-autotest",
        storageBucket: "covid19-autotest.appspot.com",
        messagingSenderId: "541298094681",
        appId: "1:541298094681:web:a715a3322843f6ff7e7748",
        measurementId: "G-0YZX1RVB1F"
    };

    var DEBUG = true; // Version debugging

    var public = {}; // Metodos y atributos publicos

    public.init = function () { // Inicializacion del middleware
        return new Promise(function (fulfill, reject) {
            try {
                firebase.initializeApp(firebaseConfig);
                firebase.analytics();
                return fulfill("App inicializada.");
            } catch (e) {
                return reject(e);
            }
        });
    };

    public.getTree = function () { // Leer arbol de decision desde hosting
        return new Promise(function (fulfill, reject) {

            var getStaticTree = function(){ // Descargar version de hosting
                $.getJSON("custom/tree.json", function (result) {
                    if (DEBUG) console.log(result);
                    return fulfill(result);
                }, function (err) {
                    return reject(err);
                });
            };

            public.db.getSortedLimited("decisionTrees", "timestamp", 1)
            .then(function(snapshot){
                snapshot.forEach(function(data){
                    if(DEBUG) console.log(data.val());
                    return fulfill(data.val());
                })
            })
            .catch(function(err){ // Ante error de consulta (puede ser por permisos)
                if(DEBUG) console.log(err);
                getStaticTree(); // Tomar datos del archivo de hosting
            });
        });
    };

    public.checkLocation = function () { // Obtener posiscion del cliente y comparar con filtro
        return new Promise(function (fulfill, reject) {

            var check = function (config) { // Realizar el checkeo con la configuracion
                if(DEBUG) console.log(config);
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        // Determinar distancia al centro del area
                        var deltaX = position.coords.latitude - config.locationFilter.lat;
                        var deltaY = position.coords.longitude - config.locationFilter.lng;
                        var range = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                        if (DEBUG) {
                            console.log("Filtro: Lat.: " + position.coords.latitude + " -- Lng: " + position.coords.longitude);
                            console.log("Cliente: Lat: " + config.locationFilter.lat + " -- Lng: " + config.locationFilter.lng);
                            console.log("Distancia: " + range);
                        }

                        if (range < config.locationFilter.range) // Si esta dentro de rango
                            return fulfill({lat:position.coords.latitude, lng:position.coords.longitude});
                        else // Si no pertenece al area de analisis
                            return reject({
                                msg: "Usuario fuera de area"
                            });
                    });
                } else {
                    return reject({
                        msg: "No se pudo determinar ubicación."
                    });
                }
            };

            var getStaticConfig = function(){ // Leer configuracion del hosting
                $.getJSON("custom/config.json",
                    check, // Checkear
                    function (err) {
                        return reject(err);
                    }
                );
            };

            public.db.get("locationFilter") // Descargar configuracion de firebase
            .then(function(config){ // Callback
                if(config) // Hay datos
                    check({locationFilter:config}) // Verificar
                else // Si no hay datos, usar version statica
                    getStaticConfig();
            })
            .catch(function(err){ // Ante error de consulta (puede ser por permisos)
                if(DEBUG) console.log(err);
                getStaticConfig(); // Tomar datos de la configuracion estatica
            });

            
        });
    };

    return public;
})();