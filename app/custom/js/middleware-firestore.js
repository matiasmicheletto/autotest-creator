(function(public){ // Extension de funciones middleware: firestore

    public.fs = {}; // Metodos de firestore

    public.fs.add = function (data, collection) { // Agregar un documento a la collection
        return new Promise(function (fulfill, reject) {
            firebase.firestore().collection(collection).add(data)
                .then(function (docRef) {
                    return fulfill(docRef); // docRef.id tiene el id del document cargado
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };

    public.fs.set = function (data, collection, document) { // Asignar objeto al document de una collection
        return new Promise(function (fulfill, reject) {
            firebase.firestore().collection(collection).doc(document).set(data)
                .then(function () {
                    return fulfill();
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };

    public.fs.update = function(data, collection, document) { // Actualizar datos existentes
        return new Promise(function (fulfill, reject) {
            firebase.firestore().collection(collection).doc(document).update(data)
                .then(function () {
                    return fulfill();
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };

    public.fs.delete = function(collection, document) { // Actualizar datos existentes
        return new Promise(function (fulfill, reject) {
            firebase.firestore().collection(collection).doc(document).delete()
                .then(function () {
                    return fulfill();
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };

    public.fs.getCollection = function (collection) { // Descargar collection
        return new Promise(function (fulfill, reject) {
            firebase.firestore().collection(collection).get()
                .then(function (querySnapshot) {
                    return fulfill(querySnapshot);
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };

    public.fs.getDocument = function(collection,document){
        return new Promise(function (fulfill, reject) {
            firebase.firestore().collection(collection).doc(document).get()
                .then(function (querySnapshot) {
                    var data = querySnapshot.data();
                    data.key = querySnapshot.id;
                    return fulfill(data);
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };


    ///// Consultas //////
    // Los resultados retornan como arrays y las claves van como atributo "key" de cada elemento

    public.fs.query = function (collection, key, operator, value, limit) { // Consulta por campos de documents
        return new Promise(function (fulfill, reject) {
            var result = [];
            var theQuery;
            if(limit)
                theQuery = firebase.firestore().collection(collection).where(key, operator, value).limit(limit);
            else
                theQuery = firebase.firestore().collection(collection).where(key, operator, value);
            
            theQuery.get()
                .then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                        var data = doc.data();
                        data.key = doc.id;
                        result.push(data);
                    });
                    return fulfill(result);
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };

    public.fs.querySortedLimited = function (collection, key, operator, value, orderBy, limit) { // Consulta por campos de documents
        return new Promise(function (fulfill, reject) {
            var result = [];
            firebase.firestore().collection(collection).where(key, operator, value).orderBy(orderBy, "desc").limit(limit).get()
                .then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                        var data = doc.data();
                        data.key = doc.id;
                        result.push(data);
                    });
                    return fulfill(result);
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };

    public.fs.queryMultipleLimited = function(collection, keys, operators, values, limit){
        return new Promise(function (fulfill, reject) {
            var result = [];
            var col = firebase.firestore().collection(collection);
            for(var k in keys) // Concatenar multiples filtros
                col = col.where(keys[k], operators[k], values[k])
            col.limit(limit).get()
                .then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                        var data = doc.data();
                        data.key = doc.id;
                        result.push(data);
                    });
                    return fulfill(result);
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };
    
})(middleware)