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

    public.init = function(){ // Inicializacion del middleware
        return new Promise(function(fulfill, reject){
            try{
                firebase.initializeApp(firebaseConfig);
                firebase.analytics();
                return fulfill("App inicializada.");
            }catch(e){
                return reject(e);
            }
        });
    };

    public.getLocalTree = function(){ // Leer arbol de decision desde hosting
        return new Promise(function(fulfill, reject){
            $.getJSON("custom/tree.json", function (result) {
                if(DEBUG) console.log(result);
                return fulfill(result);
            }, function (err) {
                return reject(err);
            });
        });
    };

    public.checkLocation = function(){ // Obtener posiscion del cliente y comparar con filtro
        return new Promise(function(fulfill, reject){
            $.getJSON("custom/config.json", function (result) { // Leer config
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position){
                        // Determinar distancia al centro del area
                        var deltaX = position.coords.latitude - result.locationFilter.lat;
                        var deltaY = position.coords.longitude - result.locationFilter.lng;
                        var range = Math.sqrt(deltaX*deltaX + deltaY*deltaY);

                        if(DEBUG){
                            console.log("Filtro: Lat.: " + position.coords.latitude + " -- Lng: " + position.coords.longitude);
                            console.log("Cliente: Lat: " + result.locationFilter.lat + " -- Lng: " + result.locationFilter.lng);
                            console.log("Distancia: "+range);
                        }

                        if(range < result.locationFilter.range) // Si esta dentro de rango
                            return fulfill();
                        else // Si no pertenece al area de analisis
                            return reject({msg: "Usuario fuera de area"});
                    });
                } else {
                    return reject({msg:"No se pudo determinar ubicación."});
                }    
            }, function (err) {
                return reject(err);
            });
        });
    };

    return public;
})();