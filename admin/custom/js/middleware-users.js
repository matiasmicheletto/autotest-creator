(function (public) { // Extension de funciones middleware: auth

    public.users = {}; // Metodos de autenticacion

    public.users.onUserSignedIn = function (uid) { // Overridable - inicio de sesion
        console.log("default -- logged in " + uid);
    };

    public.users.onUserSignedOut = function () { // Overridable - cierre de sesion
        console.log("default -- logged out");
    };

    public.users.signIn = function (form) { // Iniciar sesión
        return new Promise(function (fulfill, reject) {
            firebase.auth().signInWithEmailAndPassword(form.email, form.password)
                .catch(function (error) {
                    var errorCode = error.code,
                        errorMessage;
                    switch (errorCode) {
                        case 'auth/wrong-password':
                            errorMessage = "La contraseña es incorrecta.";
                            break;
                        case 'auth/user-disabled':
                            errorMessage = "El usuario se haya inhabilitado momentáneamente.";
                            break;
                        case 'auth/invalid-email':
                            errorMessage = "El email no es válido. Quizá esté mal escrito o no exista.";
                            break;
                        case 'auth/user-not-found':
                            errorMessage = "El usuario no existe.";
                            break;
                        default:
                            errorMessage = "Algo pasó.. revisa tu conexión a internet e intentálo nuevamente.";
                            break;
                    }
                    return reject([errorCode, errorMessage]);
                })
                .then(function (result) {
                    return fulfill("Logeado correctamente.");
                });
        });
    };

    public.users.signOut = function () {
        return new Promise(function (fulfill, reject) {
            firebase.auth().signOut()
                .then(function () {
                    return fulfill("Ha salido de la aplicación.");
                })
                .catch(function (error) {
                    return reject([error, "Algo pasó.. intentálo nuevamente."]);
                });
        });
    };

    public.users.signUp = function (form) { // Registrarse como nuevo usuario
        return new Promise(function (fulfill, reject) {
            firebase.auth().createUserWithEmailAndPassword(form.email, form.password)
                .catch(function (error) {
                    var errorCode = error.code,
                        errorMessage;
                    switch (errorCode) {
                        case 'auth/weak-password':
                            errorMessage = "La contraseña es demasiado débil. Intenta con una más segura.";
                            break;
                        case 'auth/email-already-in-use':
                            errorMessage = "Éste email ya existe en nuestra base de datos.";
                            break;
                        case 'auth/invalid-email':
                            errorMessage = "El email no es válido. Revisa lo ingresado.";
                            break;
                        case 'auth/operation-not-allowed':
                            errorMessage = "No se puede crear la cuenta para ese usuario. Ponete en contacto con los administradores.";
                            break;
                        default:
                            errorMessage = "Algo pasó... revisa tu conexión a internet e intentálo nuevamente.";
                            break;
                    }
                    return reject([errorCode, errorMessage]);
                })
                .then(function (result) {
                    fullfill(result); // Registro exitoso, result.user.uid tiene el id generado para ese usuario
                });
        });
    };

    public.users.resetPwd = function (email) { // Restablecer contrasenia
        return new Promise(function (fulfill, reject) {
            firebase.auth().sendPasswordResetEmail(email)
                .then(function () {
                    return fulfill("Listo. Revisa tu correo electrónico.");
                })
                .catch(function (error) {
                    return reject([error, "Algo pasó.. intentálo nuevamente."]);
                });
        });
    };
    
})(middleware)