/**
 * Created by iissuser on 2015/8/11.
 */
define(['app','jquery','bootbox'], function (app, $,bootbox) {
    bootbox.setLocale("zh_CN");
    return app.directive('leftPanel', function (dataFactory) {
        return {

            templateUrl: '/js/directives/templates/leftPanel.html',
            replace: true,
            restrict: 'E',
            //scope: {},

            controller: function ($scope, $routeParams) {

                $scope.show = true;
                $scope.Indent = "leftIndent";
                $scope.autoHide = function () {
                    if ($("#leftListFrame").hasClass("leftIndent"))
                    {
                       
                        $("#leftListFrame").removeClass("leftIndent");
                        $("#leftListFrame").addClass("leftDecrease");
                        $("#LeftMenu").hide();
                        $("#leftPanel").css("width", "13px");
                      
                    } else
                    {
                        $("#leftPanel").css("width", "215px");
                        $("#leftListFrame").removeClass("leftDecrease");
                        $("#leftListFrame").addClass("leftIndent");
                        $("#LeftMenu").show();
                       
                    }

                };
                //dataReady
                $scope.scenarios = [];
                $scope.ds = [];
                $scope.theme = [];
                $scope.currentScenario = undefined;


                $scope.$on('changeScenario', function (d, scenarioId) {
                    for (var i = 0,item; item = $scope.scenarios[i]; i++){
                        if(item.id == scenarioId){
                            $scope.currentScenario = item;
                            break;
                        }
                    }
                    for(var i = 0, item; item = $scope.config.theme[0] ; i++){
                        if (item.title == $scope.currentScenario.theme){
                            $scope.stylePath = item.css;
                            break;
                        }
                    }
                });

                //var dataIndex = "water";
                $scope.$on('ready', function (d, data) {
                    $scope.scenarios = data.scenario;
                    $scope.ds = data.dataSource;
                    $scope.theme = data.theme;
                });

                $scope.changeLayout = function (id) {
                    dataIndex = this.item.dataIndex;
                    $scope.$broadcast('changeScenario', id);
                }

                $scope.changeTheme = function () {
                    var theme = this.t;
                    $scope.$broadcast('changeTheme', theme);
                }

                $scope.dsName = '';

                $scope.uploadDataSource = function () {
                    dataFactory.uploadDataSource($scope.dsName,$routeParams.tid, function (data) {
                        var dsObj = {
                            "id": data.dataSourceId,
                            "title": data.dataSourceName,
                            "icon":""
                        }
                        $scope.ds.push(dsObj);
                        //alert('数据源上传成功!');
                        bootbox.alert({title:"提示",message:'数据源上传成功!', callback:function () {

                        }});
                    });
                }

                $scope.changeDataSource = function () {
                    var self = this.item;
                    $scope.currentScenario.dataSource = self.id;  //改变layouts的数据源
                    dataFactory.changeDataSource(self.id).then(function(data){
                        var type = data[$scope.current.dataIndex];//{ 监测点:[]... }
                        var k = Object.keys(type)[0];
                        var startTime = dataFactory.getStartDateTime(type[k]);

                        $scope.$broadcast('dataReady', dataFactory.filterByTime(data[$scope.currentScenario.dataIndex], startTime));

                    }, function (error) {
                        console.log(error);
                    });
                }

            }
        };
    });
});