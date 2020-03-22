(function (public) { // Extension de funciones middleware: realtime database

    public.db = {}; // Metodos de realtime database

    public.db.listen = function (path, callback_success, callback_error) { // Escuchar cambios
        firebase.database().ref(path).on('value',
            function (snapshot) {
                callback_success(snapshot.val(), snapshot.key);
            },
            function (error) {
                callback_error(error);
            });
    };

    public.db.listenChild = function(path, child, value, callback_success, callback_error) { // Escucha cambios con filtro
        firebase.database().ref(path).orderByChild(child).equalTo(value).on('child_added',
            function (snapshot) {
                callback_success(snapshot.val(), snapshot.key);
            },
            function (error) {
                callback_error(error);
            });
    };

    public.db.stopListener = function(path){ // Detener escuchador
        return new Promise(function (fulfill, reject) {
            firebase.database().ref(path).off()
                .then(function () {
                    return fulfill();
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };

    public.db.get = function (path) { // Descargar tabla de la db
        return new Promise(function (fulfill, reject) {
            firebase.database().ref(path).once('value')
                .then(function (snapshot) {
                    return fulfill(snapshot.val());
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };

    public.db.getSorted = function (path, key) { // Obtener lista ordenada por key
        return new Promise(function (fulfill, reject) {
            firebase.database().ref(path).orderByChild(key).once('value')
                .then(function (snapshot) {
                    return fulfill(snapshot);
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };

    public.db.getSortedLimited = function (path, key, limit) { // Obtener lista ordenada por key y con limite de entradas
        return new Promise(function (fulfill, reject) {
            firebase.database().ref(path).orderByChild(key).limitToLast(limit).once('value')
                .then(function (snapshot) {
                    return fulfill(snapshot);
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };

    public.db.query = function(path, key, value) { // Consulta por valor
        return new Promise(function (fulfill, reject) {
            firebase.database().ref(path).orderByChild(key).equalTo(value).once('value')
                .then(function (snapshot) {
                    return fulfill(snapshot);
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };

    public.db.set = function (data, path) { // Actualizar entrada de la db
        return new Promise(function (fulfill, reject) {
            firebase.database().ref(path).set(data)
                .then(function (snapshot) {
                    return fulfill(snapshot);
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };

    public.db.update = function (data, path) { // Actualizar entrada de la db
        return new Promise(function (fulfill, reject) {
            firebase.database().ref(path).update(data)
                .then(function (snapshot) {
                    return fulfill(snapshot);
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };

    public.db.push = function (data, path) { // Nueva entrada (retorna id)
        return new Promise(function (fulfill, reject) {
            firebase.database().ref(path).push(data)
                .then(function (snapshot) {
                    return fulfill(snapshot);
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };

    public.db.pushMultiple = function (dataArray, path) { // Subir multiples entradas a un mismo directorio
        return new Promise(function (fulfill, reject) {
            var job = [];
            for (var k in dataArray) // Para cada objeto 
                job.push(firebase.database().ref(path).push(dataArray[k])); // TODO: usar multiples paths 
            Promise.all(job) // Ejecutar promise
                .then(function (snapshot) { // Snapshot es un array que contiene los keys
                    return fulfill(snapshot); // Del otro lado se puede hacer un for para retornar
                })
                .catch(function (error) { // Ver si retorna un solo error o varios
                    return reject(error);
                });
        });
    };

})(middleware);