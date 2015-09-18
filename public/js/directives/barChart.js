/**
 * Created by iissuser on 2015/9/10.
 */
define(['app'], function (app) {
    app.directive('barChart', function () {
        return {
            restrict: 'A',
            scope: {},
            controller: function ($scope, $element) {

                $scope.model = $scope.$parent.model;
                var cf = $scope.$parent.controlFuns = {};
                /*functions for edit model*/
                cf.getDataColumns = function () {
                    if ($scope.$parent.preModel.sheet) {
                        return Object.keys(dataCache[$scope.$parent.preModel.sheet][0]);
                    }
                }

                cf.removeColumn = function (index) {
                    $scope.$parent.preModel.config.splice(index, 1);
                }

                cf.addColumn = function () {
                    var configItem = {};
                    configItem.DisplayName = "显示名称";
                    configItem.standerValue = "3";

                    $scope.$parent.preModel.config.push(configItem);
                }

                var sheets = undefined;
                cf.getSheets = function () {
                    if (!sheets && dataCache) {
                        sheets = Object.keys(dataCache);
                    }
                    return sheets;
                }

                cf.apply = function () {
                    angular.copy($scope.$parent.preModel, $scope.model);
                    createChart(chart, mData[$scope.selectedObj.columnName], xAxisValues, $scope.selectedObj.standerValue, $scope.selectedObj.maxValue);
                }

                /*End functions for edit model*/


                $scope.selectedObj = $scope.model.config[0];
                //$scope.$on('bar-chart-ready', function (d, data) {
                //    $scope.model = data.control.model;
                //});

                function createChart(chart, data, xAxisValues,standerValue, yMax, yMin) {
                    var count=0;
                    var min = yMin ? yMin : 0;
                    var max = yMax ? yMax : 8;

                    var option = {
                        grid: {
                            x: 30,
                            y: 5,
                            x2: 30,
                            y2: 30,
                        },
                        color: [
                            '#008001'
                        ],
                        tooltip: {
                            trigger: 'item'
                        },
                        calculable: false,
                        xAxis: [
                            {
                                type: 'category',
                                axisLine: {
                                    show: true,
                                    lineStyle: {
                                        color: '#a7a7a5',
                                        width: 1,
                                    }
                                },
                                axisLabel: {
                                    show: true,
                                    interval: 0,
                                    //rotate: -60,
                                    formatter: function (val) {
                                        return xAxisValues.indexOf(val) +1;
                                    },
                                    textStyle: {
                                        color: '#a7a7a5',
                                        fontSize: 12,
                                    },

                                },
                                data: xAxisValues //['1', '2', '3', '4', '5', '6', '7']
                            }

                        ],
                        yAxis: [
                            {
                                splitNumber: "4",
                                min: min,
                                max: max,
                                type: 'value',
                                axisLine: {
                                    show: true,
                                    lineStyle: {
                                        color: '#a7a7a5',
                                        width: 1,
                                    }
                                },
                                axisLabel: {
                                    show: true,
                                    textStyle: {
                                        color: '#a7a7a5',
                                        fontSize: 12,
                                    },

                                }
                            }
                        ],
                        series: [
                            {
                                type: 'bar',
                                data: data,
                                markLine: {
                                    data: [
                                        [{name: '标准线', value: standerValue, xAxis: -1, yAxis: standerValue},
                                            {name: '标准线', xAxis: xAxisValues.length, yAxis: standerValue}]
                                    ],
                                    itemStyle: {
                                        normal: {
                                            color: '#FE0000',
                                            borderWidth: 2,
                                            borderColor: '#FE0000'
                                        }
                                    },
                                }
                            }
                        ]
                    };

                    chart.setOption(option, true);
                }

                var chart = echarts.init($element.children()[1].childNodes[1]);
                var _data = [];
                var mData = [];
                var dataCache = undefined;
                var xAxisValues = []; //['1', '2', '3', '4', '5', '6', '7'];

                $scope.$on("destroy", function () {
                    $scope.$destroy();
                });

                $scope.$on('dataReady', function (d, data) {
                        dataCache = data;
                        var sheet = data[$scope.model.sheet];
                        if (sheet.length>0){
                            mData = getValuesArray(sheet);
                            _data = mData[$scope.model.config[0].columnName];
                            xAxisValues = getXAxisValues(sheet);
                            createChart(chart, _data, xAxisValues, $scope.selectedObj.standerValue, $scope.selectedObj.maxValue);
                        }
                    }
                );

                function getXAxisValues(dataSheet) {
                    var xAxises = [];

                    for (var i = 0; i < dataSheet.length; i++) {
                        xAxises.push(dataSheet[i][$scope.model.xAxisColName]);
                    }

                    return xAxises;
                }

                function getValuesArray(dataArray) {
                    var processedData = {};
                    var config = $scope.model.config;
                    var column = "";
                    var tempArray = undefined;
                    for (var i = 0; i < config.length; i++) {
                        column = config[i].columnName;
                        tempArray = [];
                        for (var j = 0; j < dataArray.length; j++) {
                            tempArray.push(dataArray[j][column]);
                        }

                        processedData[column] = tempArray;
                    }

                    return processedData;
                }

                $scope.selectChanged = function (obj) {

                    var selectedCol = obj.columnName;
                    createChart(chart, mData[selectedCol], xAxisValues, obj.standerValue, obj.maxValue);
                }
            },
            templateUrl: '/js/directives/templates/barChart.html',
            replace: true
        };
    });
});