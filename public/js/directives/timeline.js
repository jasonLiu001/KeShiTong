/**
 * Created by issuser on 2015/9/9.
 */
require(['app'], function (app) {
    app.directive('timeLine', function ($routeParams, $interval, dataFactory) {
        return {
            restrict: 'A',
            replace:true,
            scope: {},
            controller: function ($scope, $element) {

                $scope.model = $scope.$parent.model;
                var dataCache = undefined;

                var startDate = undefined;

                //获取当前作用域的父作用域，通常父作用域是zone指令中的$scope
                var cf = $scope.$parent.controlFuns = {};

                $scope.times = [];//[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

                var ulElement = $element.find('ul');
                var current_Time = $element.find('#current_Time');

                var current_TimeWidth = 20;//$element.find('#current_Time').width();
                var liWidth = 80; //$element.find('#switch_Time ul li:first').width();

                var count = 5;
                //var i = 0;
                $scope.leftPosition = (liWidth / 2) - (current_TimeWidth / 2);
                $scope.currHour = 0;
                $scope.isMoveing = false;
                var interVal;



                $scope.moveTime = function (index) {
                    var marginLeft = parseInt(ulElement.css('margin-left'));
                    if(index % count == 0){
                        $scope.leftPosition = (liWidth / 2) - (current_TimeWidth / 2);
                        var css = {};
                        if(index == 0){
                            css['margin-left'] = 0;
                        }else{
                            css['margin-left'] = marginLeft - liWidth * count;
                        }
                        ulElement.animate(css,500);
                    }else{

                        $scope.leftPosition = $scope.leftPosition + liWidth;//($scope.leftPosition * (index + 1)) //index * 7 + 2 + '%';
                    }
                    $scope.currHour = index;//0,1,2,3,4,5,6

                    if($scope.model.dateType == dateType[0]){//小时
                        $scope.$emit('filterByTime', startDate + ' ' + $scope.times[index]+":00:00");
                    }else if($scope.model.dateType == dateType[1]){//天
                        $scope.$emit('filterByTime', $scope.times[index]);
                    }else{
                        $scope.$emit('filterByTime', $scope.times[index]);
                    }
                }



                function getTimes (array,f) {
                    startDate = dataFactory.getStartDateTime(array);
                    startDate = startDate.substring(0,startDate.indexOf(' '))

                    var self = array;
                    var groups = {};
                    self.forEach(function (o) {
                        var group = f(o);
                        groups[group] = groups[group] || [];
                        groups[group].push(o);
                    });

                    return Object.keys(groups).map(function (group) {
                        if($scope.model.dateType == dateType[0]){//小时
                            return new Date(group).getHours();
                        }else if($scope.model.dateType == dateType[1]){//天
                            return group;
                        }else{
                            return group;
                        }
                    }).sort(function (current, next) {
                        return new Date(current).getTime() - new Date(next).getTime();
                    });
                }


                $scope.$on('dataReady',function(d,data){
                    dataCache = data;
                    initTimeline();
                });


                var initTimeline = function () {
                    var ds = $scope.$parent.$parent.dataSource;
                    var k = Object.keys(ds)[0];
                    $scope.times = getTimes(ds[k], function (item) {
                        return item['时间'];
                    });
                }



                $scope.$on('stopTimer',function(d,data){
                    if (interVal){
                        $interval.cancel(interVal);
                    }
                });

                $scope.autoMove = function () {
                    $scope.isMoveing = !$scope.isMoveing;
                    if ($scope.isMoveing) {
                        interVal = $interval(function () {
                            $scope.currHour += 1;
                            if ($scope.currHour >= $scope.times.length) {
                                $scope.currHour = 0;
                            }
                            $scope.moveTime($scope.currHour);
                        }, 2000);
                    }
                    else {
                        $interval.cancel(interVal);
                    }
                }


                var sheets = undefined;
                cf.getSheets = function () {
                    if(!sheets && dataCache){
                        sheets = Object.keys(dataCache);
                    }
                    return sheets;
                }

                var dateType = ['小时','天'];
                cf.getDateType = function () {
                    return dateType;
                }


                cf.apply = function () {
                    angular.copy($scope.$parent.preModel,$scope.model);
                    initTimeline();
                }


                /**
                 * 在preview和publish页面中默认自动播放
                 */
                if(!$routeParams.design){
                    $scope.autoMove();
                }
            },
            templateUrl:"/js/directives/templates/timeline.html"
        };
    });
});