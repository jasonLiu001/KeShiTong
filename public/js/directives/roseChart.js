/**
 * Created by iissuser on 2015/8/31.
 */
define(['app'], function (app) {
    app.directive('roseChart', function () {
        return {
            restrict: 'A',
            scope:{},
            controller: function ($scope, $element) {

                $scope.model = $scope.$parent.model;
                /* $scope.$on('rose-chart-ready', function (d, data) {
                 $scope.model = data.control.model;
                 });*/
                /* Function for edit control */
                var dataCache = undefined;
                //$scope.controlFuns = {};

                var $controlFuns = $scope.$parent.controlFuns = {};
                //$scope.$parent.preModel = $scope.$parent.preModel;


                $controlFuns.selectColChanged = function (selectCol) {
                    $scope.$parent.preModel.dataColumn = selectCol;
                }

                $controlFuns.getGroupValues = function () {
                    var colValues = $scope.model.config.select(function (item) {
                        return item.value;
                    });
                    return colValues;
                }

                $controlFuns.removeColumn = function (index) {
                    $scope.$parent.preModel.config.splice(index, 1);
                }

                $controlFuns.addColumn = function () {
                    var configItem = {};
                    configItem.value = "分组值";
                    configItem.name = "分组名称";
                    configItem.color = "#000000";

                    $scope.$parent.preModel.config.push(configItem);
                }

                Array.prototype.contains = function(f) {
                    var i = this.length;
                    while (i--) {
                        var result = f(this[i]);
                        if (result) {
                            return true;
                        }
                    }
                    return false;
                }



                function groupByDataForRoleChart(array,f){
                    var self = array;
                    var groups = {};
                    self.forEach(function (o) {
                        var group = f(o);

                        var result = $scope.model.config.contains(function (item) {
                            return item.value == group;
                        });

                        if(result){
                            groups[group] = groups[group] || [];
                            groups[group].push(o);
                        }
                    });

                    return Object.keys(groups).map(function (group) {
                        var item = $scope.model.config.filter(function (i) {
                            return i.value == group;
                        })[0];
                        var result = {key: item.name, value: groups[group]};
                        return result;
                    })
                }


                Array.prototype.select = function (f) {
                    var self = this;
                    var array = [];
                    self.forEach(function (o) {
                        var x = f(o);
                        array.push(x);
                    });
                    return array;
                }

                function createChart(chart, data) {
                    var colors = $scope.model.config.select(function (item) {
                        return item.color;
                    });
                    var option = {
                        toolbox: {
                            show: false
                        },
                        color: colors, //['#4666C9', '#789EEF', '#B9CCF7', '#FF7E7E', '#F7412C'],
                        calculable: true,
                        series: [
                            {
                                name: ' ',
                                type: 'pie',
                                radius: ['25%', '80%'],
                                center: ['54%', '50%'],
                                roseType: 'area',
                                width: '40%',
                                max: 40,
                                sort: 'ascending',
                                itemStyle: {
                                    normal: {

                                        label: {
                                            show: true,
                                            textStyle: {color: '#a7a7a5',},
                                            formatter: "{a} {b} ({d}%)"
                                        },
                                        labelLine: {
                                            show: true,
                                            lineStyle: {
                                                color: '#a7a7a5',
                                            },
                                            length: 1
                                        }
                                    }
                                },
                                data: data
                            }
                        ]
                    };
                    chart.setOption(option,true);
                }

                var chart = echarts.init($element.children()[1].childNodes[1]);

                function bluidData(){
                    var _data = [];
                    var sheet = dataCache[$scope.model.sheet];
                    var group = groupByDataForRoleChart(sheet,function (item) {
                        return item[$scope.model.dataColumn];
                    });
                    for (var i = 0; i < group.length; i++) {
                        var groupItem = group[i];
                        var result = (groupItem.value.length / sheet.length * 100);
                        _data.push({name: groupItem.key, value: result});
                    }
                    return _data;
                }



                $scope.$on('dataReady', function (d, data) {
                    dataCache = data;
                    createChart(chart, bluidData());
                });


                $scope.$on("destroy",function(){
                    $scope.$destroy();
                });


                $controlFuns.apply = function () {
                    angular.copy($scope.$parent.preModel, $scope.model);
                    createChart(chart, bluidData());
                }


                $controlFuns.getDataColumnNames = function () {
                    //var dataColumnNames = [];
                    //
                    //if (dataCache != undefined) {
                    //    dataColumnNames = Object.keys(dataCache[0]);
                    //}
                    //return dataColumnNames;
                    if($scope.$parent.preModel.sheet) {
                        return Object.keys(dataCache[$scope.$parent.preModel.sheet][0]);
                    }
                }


                var sheets = undefined;
                $controlFuns.getSheets = function () {
                    if(!sheets && dataCache){
                        sheets = Object.keys(dataCache);
                    }
                    return sheets;
                }

            },
            templateUrl: '/js/directives/templates/roseChart.html',
            replace: true
        };
    });
});