define(['app', 'resultStatus', 'user'], function (app, resultStatus) {
    
    return app.controller('preview', function ($scope, $http, $location,$routeParams, user, dataFactory) {
        $scope.pageClass = "page-home";
        $scope.model= user.getUser();
        //注销登录
        $scope.logout = function () {
            $http.post('/api/account/logout').success(function (data, status, headers, config) {
                if (data.status == resultStatus.success && data.data) {
                    user.logout();
                    $location.path('/login');
                } else {
                    alert(data.message);
                }
            }).error(function (data, status, headers, config) { 
        
            });
        }

        dataFactory.getUserTemplateData($routeParams.tid).then(function (data) {
            $scope.config = JSON.parse(data.data.template_config);
            $scope.$broadcast('ready', $scope.config);//广播给
            $scope.$broadcast('changeScenario', $scope.config.currentScenario);//广播更改布局事件到layout
            $scope.$broadcast('controlsReady', $scope.config.controls);//广播控件准备就绪事件到rightPanel
            //$scope.$broadcast('scenarioReady', $scope.config.scenario);
        }, function (err) {
            console.info(err);
        });

        $scope.clientHeight = document.body.clientHeight - 50;
    });
});