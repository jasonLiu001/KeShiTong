define(['app','jquery', 'resultStatus','bootbox', 'user'], function (app,$, resultStatus,bootbox) {
    bootbox.setLocale("zh_CN");
    return app.controller('editor', function ($scope, $http, $location, $routeParams, user, dataFactory) {
        $scope.pageClass = "page-editor";

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


        $scope.config = undefined;

        //var tid = undefined;

        $scope.templateName = '';

        /**
         * 获取json配置
         *
         */
        dataFactory.getUserTemplateData($routeParams.tid).then(function (data) {
            $scope.templateName = data.data.name;
            $scope.config = JSON.parse(data.data.template_config);
            $scope.$broadcast('ready', $scope.config);//广播给
            $scope.$broadcast('changeScenario', $scope.config.currentScenario);//广播更改布局事件到layout
            $scope.$broadcast('controlsReady', $scope.config.controls);//广播控件准备就绪事件到rightPanel
            //$scope.$broadcast('scenarioReady', $scope.config.scenario);
        }, function (err) {
            console.info(err);
        });

        $scope.userTemplateId = $routeParams.tid;

        $scope.getEditTemplateUrl = function () {
            return $scope.$root.editTemplateUrl;
        }

        $scope.clientHeight = document.body.clientHeight - 51;

        //var style = { "height" : (document.body.clientHeight - 51-120) +'px'};

        //$scope.mainAreaHeight = style;

        $("#mainAera").niceScroll();
        
        $scope.saveUserTemplate = function () {
            dataFactory.saveTamplate($routeParams.tid, $scope.templateName, $scope.config).then(function (data) {
                console.info('success..');
                console.log($scope.config);
                bootbox.alert({title:"提示",message:'用户模板保存成功!', callback:function () {

                }});
                //alert('用户模板保存成功!');
            }, function (err) {
                console.info(err);
            })
        }


        $scope.publishUserTemplate = function () {
            dataFactory.publishUserTemplate($routeParams.tid).then(function (data) {
                console.info('success..');
                bootbox.alert({title:"提示",message:'用户模板发布成功!', callback:function () {

                }});
                //alert('用户模板发布成功!');
            }, function (err) {
                console.info(err);
            })
        }
    });
});