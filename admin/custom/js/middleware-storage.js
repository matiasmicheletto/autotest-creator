(function(public) { // Extension de funciones middleware: storage

    public.storage = {}; // Metodos de storage

    public.storage.put = function (file, path, filename) { // Subir archivo
        return new Promise(function (fulfill, reject) {
            firebase.storage().ref().child(path + "/" + filename).put(file)
                .then(function (snapshot) {
                    var size = snapshot.totalBytes; // Tamanio de archivo
                    snapshot.ref.getDownloadURL().then(function (url) {
                        return fulfill({
                            size: size,
                            url: url
                        }); // Devolver tamanio y url del archivo
                    });
                })
                .catch(function (error) { // Ver si retorna un solo error o varios
                    return reject(error);
                });
        });
    };

    public.storage.putMultiple = function (files, path, filenames) { // Subir muchos archivos
        return new Promise(function (fulfill, reject) {
            var job = [];
            for (var k in files) // Para cada archivo                
                job.push(firebase.storage().ref().child(path + "/" + filenames[k]).put(files[k]));
            Promise.all(job) // Ejecutar promise
                .then(function (snapshot) { // Snapshot devuelve las url de manera asincrona pero en este caso es un array
                    var res = []; // Nuevamente generar promesas
                    var sizes = []; // Lista de tamanios de archivos
                    for (var k in snapshot) {
                        sizes.push(snapshot[k].totalBytes);
                        res.push(snapshot[k].ref.getDownloadURL());
                    }
                    Promise.all(res) // Ejecutar promise para obtener urls
                        .then(function (results) { // Results es un array con los urls                    
                            return fulfill({
                                sizes: sizes,
                                urls: results
                            }); // Mandar tamanio y urls
                        });
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };

    public.storage.putString = function (str, path, filename) { // Guardar string
        return new Promise(function (fulfill, reject) {
            firebase.storage().ref().child(path + "/" + filename).putString(str)
                .then(function (snapshot) {
                    snapshot.ref.getDownloadURL().then(function (url) {
                        return fulfill(url); // Devolver url de descarga
                    });
                })
                .catch(function (error) { // Ver si retorna un solo error o varios
                    return reject(error);
                });
        });
    };

    public.storage.delete = function (filename, path) { // Borrar un archivo de storage
        return new Promise(function (fulfill, reject) {
            firebase.storage().ref().child(path + "/" + filename).delete()
                .then(function () {
                    return fulfill("Borrado: " + path + "/" + filename);
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    };

})(middleware)