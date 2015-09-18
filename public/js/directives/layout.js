/**
 * Created by iissuser on 2015/8/18.
 */
define(['app'], function (app) {
    app.directive('layout', function (dataFactory, $compile, $http) {
        var linker = function ($scope, $element) {

            var startTime = undefined;
            var updatelayout = function () {
                $http({method: 'GET', url: $scope.current.templateUrl}).success(function (text) {
                    //var ele = $(text);

                    /*$.each($scope.current.zones,function(i,s){
                     if(s.id != "zone3"){
                     var zone = ele.find('#' + s.id);
                     zone.attr(s.control.name,"");//.attr("title", s.control.model.title);

                     }

                     })*/


                    $scope.$broadcast('stopTimer', {});

                    $element.html(text);//.show();
                    $compile($element.contents())($scope);

                    /**
                     * 遍历布局中的控件，并广播控件的[controlName]-ready事件
                     */
                    /*$.each($scope.current.zones,function(i,s) {
                     var eventName = s.control.name + '-ready';//控件的事件名称是一个组合字符串
                     $scope.$broadcast(eventName, s);//广播
                     });*/

                    /**
                     * 广播layoutReady事件 ，其作用是更新rightPanel中每一个控件的菜单 [zone0、zone1.....]
                     */
                    $scope.$broadcast('layoutReady', $scope.current);

                    dataFactory.changeDataSource($scope.current.dataSource).then(function (data) {
                        $scope.dataSource = data[$scope.current.dataIndex];
                        $scope.coordinates = "39°28'00.00 N170°35'00.00 E";
                        var k = Object.keys($scope.dataSource)[0];
                        startTime = dataFactory.getStartDateTime($scope.dataSource[k]);
                        /**
                         * 广播dataReady事件，其作用是将获取到的数据传递给【所有的控件】
                         */
                        $scope.$broadcast('dataReady', dataFactory.filterByTime($scope.dataSource, startTime));
                    }, function (err) {
                        console.info(err);
                    });

                }).error(function () {

                });
            }

            $scope.config = undefined;
            $scope.current = undefined;
            $scope.oriZones = [];
            $scope.oriZoneSeq = [];  // 用于保存页面上zones的默认显示顺序

            /**
             * 处理ready事件，其作用是接收整个json配置对象
             * 该广播由editor controller发出
             */
            $scope.$on('ready', function (d, data) {
                $scope.config = data;
            });

            $scope.$on('filterByTime', function (d, timeOnly) {

                //var dateString = startTime.substr(0,startTime.indexOf(" ")) + " " + timeOnly; //拼时间格式
                $scope.$broadcast('dataReady', dataFactory.filterByTime($scope.dataSource, timeOnly));
            });

            ///**
            // * 处理updateZone广播事件，其作用是更改布局中的控件
            // * 该广播由rightPanel中的控件菜单发出
            // *
            // * 实际上处理该事件的时候也会刷新整个layout.后期需改进.
            // */
            //$scope.$on('updateZone', function (d, data) {
            //    //for(var i = 0 ; i < $scope.current.zones.length; i++){
            //    //    var current = $scope.current.zones[i];
            //    //    if(current.id == data.id){
            //    //        //更新layouts的Json
            //    //        current.control = data.control;
            //    //        updatelayout();
            //    //        break;
            //    //    }
            //    //}
            //    updatelayout();
            //});

            /**
             *  处理changeLayout广播事件，其作用是更改布局
             *  该广播由leftPanel中的场景切换发出，或者第一次进入editor视图时也会发出
             */
            $scope.$on('changeScenario', function (d, scenarioId) {
                $scope.config.currentScenario = scenarioId;
                $scope.stylePath = ''
//                for (var i = 0; i < $scope.config.scenario.length; i++){
//                    var current = $scope.config.scenario[i];
//                    if(current.id == $scope.config.currentLayout){
//                        $scope.current = current;
//                        break;
//                    }
//                }
                $scope.current = $.grep($scope.config.scenario, function (item) {
                    return item.id == scenarioId
                })[0]; // 当前的layout
                $scope.oriZones = $.extend(true, [], $scope.current.zones); // 将初始状态下的currentLayout下的zones状态保存下来，使用deep copy方式防止被修改
                for (var i = 0; i < $scope.config.theme.length; i++) {
                    var current = $scope.config.theme[i];
                    if (current.title == $scope.current.theme) {
                        $scope.stylePath = current.css;
                        console.log("init===>" + $scope.stylePath);
                        break;
                    }
                }
                updatelayout();
            });

            $scope.stylePath = '';

            $scope.$on('changeTheme', function (d, theme) {


                for (var i = 0; i < $scope.config.scenario.length; i++) {
                    var current = $scope.config.scenario[i];
                    current.theme = theme.title;
                }

                $scope.stylePath = theme.css;
            });
        };

        var controller = function ($scope, $routeParams) {
            /*
             zone拖动配置
             * */
            $scope.dragConfig = {
                animation: 150,
                draggable: ".drag-zone",
                handle: ".zone-drag-handle",
                ghostClass: "drag-ghost",
                disabled: $routeParams.design != "design",
                onStart: function (evt) {
                    $("#left_Content .drag-zone").addClass("drag-zone-highlight");
                    // 仅在第一次的时候将页面上zones的顺序保存下来
                    if ($scope.oriZoneSeq.length == 0)  $("#left_Content .drag-zone>div").each(function () {
                        $scope.oriZoneSeq.push($(this).attr("id"));
                    });
                    //console.info($scope.oriZoneSeq);
                },
                onEnd: function (evt) {
                    var zoneUpdateSeq = []; // 用户拖动zones之后的排列顺序
                    $("#left_Content .drag-zone").removeClass("drag-zone-highlight");
                    $("#left_Content .drag-zone>div").each(function () {
                        zoneUpdateSeq.push($(this).attr("id"));
                    });
                    //console.info(zoneUpdateSeq);

                    if ($scope.current) {
                        var tmpZones = [];
                        // 使用$.extend()对数组进行深拷贝
                        $.each(zoneUpdateSeq, function (n, value) {
                            tmpZones.push($.extend(true, {}, $.grep($scope.oriZones, function (item) {
                                return item.id == value;
                            })[0]));
                        });
                        //console.info(tmpZones);
                        for (var i = 0, ci; ci = $scope.oriZoneSeq[i]; i++) {
                            var oldZone = $.grep($scope.current.zones, function (item) {
                                return item.id == ci;
                            })[0];
                            var newZone = tmpZones[i];
                            if (oldZone && newZone) oldZone.control = $.extend(true, {}, newZone.control);
                        }
                    }
                    //console.info($scope.config.scenario[0].zones);
                }
            };
        };

        return {
            restrict: 'E',
            replace: true,
            link: linker,
            controller: controller,
            template: ''
        }
    });
});