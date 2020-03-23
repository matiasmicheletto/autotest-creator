app.controller("login", ['$scope', '$rootScope', function ($scope, $rootScope) {
    
    $scope.login = function(){

        if(!$scope.form){
            toastr.error("Complete los campos de credenciales!");
            return;
        }

        if(!$scope.form.email){
            toastr.error("Indique su usuario!");
            return;
        }

        if(!$scope.form.password){
            toastr.error("Ingrese su contraseña!");
            return;
        }

        $rootScope.loading = true;
        middleware.users.signIn($scope.form)
        .then(function(res){
            toastr.success("Bienvenido!");
        })
        .catch(function(err){
            console.log(err);
            toastr.error(err[1]);
            $rootScope.loading = false;
            $scope.$apply();
        });
    };

    $scope.retrievePassword = function(){
        toastr.info("Pronto contaremos con esa funcionalidad.");
    };
    
}]);