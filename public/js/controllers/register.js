define(['app','resultStatus'], function (app, resultStatus) {
    
    return app.controller('register', function ($scope, $http, $location) {
        $scope.pageClass = "page-register";
        
        $scope.model = {
            emailID: "",
            userName: '',
            password: "",
            sex: '',
            post: '',
            company: '',
            trade : '',
            telphone : '',
            confirmPassWord: ""
        }
        
        $scope.register = function (isValid) {
            $http.post('/api/account/register', $scope.model).success(function (data, status, headers, config) {
                if (data.status == resultStatus.success && data.data) {
                    $location.path('/login');
                } else {
                    alert(data.message);
                }

            }).error(function (data, status, headers, config) { 
        
            });
        }
    });
});