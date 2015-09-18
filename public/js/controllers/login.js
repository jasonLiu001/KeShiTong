define(['app', 'user', 'resultStatus'], function (app, user, resultStatus) {
    
    return app.controller('login', function ($scope, $http, $location, user) {
        $scope.pageClass = "page-login";
        $scope.model = {
            emailID: "",
            passwordStr : ""
        }
        
        //登录
        $scope.login = function (isValid) {
            $http.post('/api/account/login', $scope.model).success(function (data, status, headers, config) {
                if (data.status == resultStatus.success && data.data) {
                    user.setUser(data.data);
                    $location.path('/home');
                } else {
                    alert(data.message)
                }
            }).error(function (data, status, headers, config) { 
        
            });
        }

        $scope.register = function () {
            $location.path('/register');
        }
    });
});