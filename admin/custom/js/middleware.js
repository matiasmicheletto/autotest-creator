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
    var private = {}; // Metodos y atributos privados

    public.init = function () { // Inicializacion del middleware. Descarga de configuracion
        return new Promise(function (fulfill, reject) {
            try {
                firebase.initializeApp(firebaseConfig);
                firebase.analytics();

                return fulfill();
            } catch (e) {
                return reject(e);
            }
        });
    };

    return public;
})();