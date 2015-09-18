define(['app', 'resultStatus','bootbox', 'user', 'jquery', 'bootstrap'], function (app, resultStatus,bootbox) {
    bootbox.setLocale("zh_CN");
    return app.controller('home', function ($scope, $http, $location, user, dataFactory) {
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
        };
        dataFactory.getHomePageData().then(function (data) {
            //$scope.ds = data;
            $scope.userLatestEdits = data.data.latestEdit;
            $scope.sysTemplates = data.data.templates;
            $scope.userUnpubs = data.data.unpublished;
            $scope.userPubs = data.data.published;
            //$scope.$broadcast('ready', $scope.config);
        }, function (err) {
            console.info(err);
        });

        $scope.createTemplate = function () {
            var self = this.item;
            bootbox.prompt({title:"请输入新建系统名称", callback:function (result) {
                dataFactory.createUserTemplate(self.id).then(function(data){
                    var path = '/editor/'+  data._id + '/design';
                    //save sample data source id to config
                    var config = JSON.parse(data.template_config);
                    config.dataSource[0].id = JSON.parse(data.dataSourceIds)[0];
                    for(var i= 0 ;i < config.scenario.length ; i++){
                        config.scenario[i].dataSource = config.dataSource[0].id;
                    }
                    dataFactory.saveTamplate(data._id, result, config).then(function (data) {
                        console.log(data);
                        $location.path(path);
                    }, function (err) {
                        console.log(err);
                    });
                }, function (err) {
                    console.info(err);
                });

            }});
        }

        $scope.clientHeight = document.body.clientHeight - 50;

    });
});