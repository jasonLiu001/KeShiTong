/**
 * Created by iissuser on 2015/9/1.
 */
define(['app', 'jquery'], function (app) {
    app.directive('waterProgressChart', function () {
        return {
            restrict: 'A',
            scope: {},
            controller: function ($scope) {

                $scope.model = $scope.$parent.model;
                var dataCache = undefined;

                //var rangeConfig = $scope.model.rangeConfig;
                function getBrowserType() {
                    var Sys = {};
                    var ua = navigator.userAgent.toLowerCase();
                    if (window.ActiveXObject)
                        Sys.ie = ua.match(/msie ([\d.]+)/)[1]
                    else if (document.getBoundingClientRect)
                        Sys.firefox = ua.match(/firefox\/([\d.]+)/)[1]
                    else if (window.MessageEvent && !document.getBoundingClientRect) {
                        if (navigator.userAgent.match(/Trident.*rv[ :]*11\./)) {
                            Sys.ie = "IE11";
                        }
                        else {
                            Sys.chrome = ua.match(/chrome\/([\d.]+)/)[1]
                        }
                    }
                    else if (window.opera)
                        Sys.opera = ua.match(/opera.([\d.]+)/)[1]
                    else if (window.openDatabase)
                        Sys.safari = ua.match(/version\/([\d.]+)/)[1];

                    return Sys;
                }

                function getLinerStyle() {
                    var rangeConfig = $scope.model.rangeConfig;
                    var colorsStr = "";
                    for (var i = 0; i < rangeConfig.length; i++) {
                        colorsStr += rangeConfig[i].color + ',';
                    }

                    colorsStr = colorsStr.substr(0, colorsStr.length - 1);

                    var jsonStyle = {'background': 'linear-gradient(left,' + colorsStr + ')'};
                    var browser = getBrowserType();
                    if (browser.ie) {
                        jsonStyle = {'background': '-ms-linear-gradient(left,' + colorsStr + ')'};
                    }
                    else if (browser.chrome) {
                        jsonStyle = {'background': '-webkit-linear-gradient(left,' + colorsStr + ')'};
                    }
                    else if (browser.firefox) {
                        jsonStyle = {'background': '-moz-linear-gradient(left,' + colorsStr + ')'};
                    }
                    else if (browser.opera) {
                        jsonStyle = {'background': '-o-linear-gradient(left,' + colorsStr + ')'};
                    }

                    return jsonStyle;

                }

                $scope.barStyle = getLinerStyle();

                function getToolTipForIcon(objValue) {
                    var rangeConfig = $scope.model.rangeConfig;
                    for (var i = 0; i < rangeConfig.length; i++) {
                        if (rangeConfig[i].min <= objValue && rangeConfig[i].max > objValue) {
                            return rangeConfig[i].name;
                        }
                    }
                }

                $scope.ranking = [];

                function groupByForColorBar(array, f) {
                    var self = array;
                    var groups = {};
                    self.forEach(function (o) {
                        var group = f(o);
                        groups[group] = groups[group] || [];
                        groups[group].push(o);
                    });

                    return groups;
                };

                function getSortedArray(units) {

                    var rangeConfig = $scope.model.rangeConfig;
                    var objArray = [];
                    var tempArray = [];
                    var tempAvgValue = undefined;

                    for (var i = 0; i < Object.keys(units).length; i++) {
                        var obj = {};
                        var tempValue = 0;
                        obj.name = Object.keys(units)[i];
                        tempArray = units[Object.keys(units)[i]];

                        for (var j = 0; j < tempArray.length; j++) {
                            tempValue += parseInt(tempArray[j][$scope.model.dataColumn]);
                        }
                        //计算平均值，并按配置划分区间
                        tempAvgValue = Math.round(tempValue / tempArray.length);

                        for (var k = 0; k < rangeConfig.length; k++) {
                            if (rangeConfig[k].min <= tempAvgValue && rangeConfig[k].max > tempAvgValue) {
                                obj.avg = k + 1;
                                break;
                            }
                        }

                        obj.styleLeft = (100 / rangeConfig.length) * obj.avg + '%';
                        obj.toolTip = getToolTipForIcon(obj.avg);

                        objArray.push(obj);
                    }

                    return objArray.sort(function (a, b) {
                        return parseFloat(a.avg) - parseFloat(b.avg);
                    });
                }

                $scope.getIconUrl = function (item) {
                    if (item == null || item == undefined || !item.hasOwnProperty("avg")){
                        return "images/1.png";
                    }
                    else {
                        return 'images/' + item.avg + ".png";
                    }
                };
                $scope.$on('dataReady', function (d, data) {
                    dataCache = data;
                    var units = groupByForColorBar(data[$scope.model.sheet], function (item) {
                        return item[$scope.model.unitColumn];
                    });
                    $scope.ranking = getSortedArray(units);
                });


                $scope.$on("destroy", function () {
                    $scope.$destroy();
                });

                /*functions for edit popup*/
                var $controlFuns = $scope.$parent.controlFuns = {};

                $controlFuns.getDataColumnNames = function () {
                    //var dataColumnNames = [];
                    //
                    //if (dataCache != undefined) {
                    //    dataColumnNames = Object.keys(dataCache[0]);
                    //}
                    //return dataColumnNames;
                    if ($scope.$parent.preModel.sheet) {
                        return Object.keys(dataCache[$scope.$parent.preModel.sheet][0]);
                    }
                }

                $controlFuns.selectColChanged = function (selectCol) {
                    $scope.$parent.preModel.dataColumn = selectCol;
                }

                $controlFuns.selectUnitColChanged = function (selectCol) {
                    $scope.$parent.preModel.unitColumn = selectCol;
                }

                $controlFuns.removeColumn = function (index) {
                    $scope.$parent.preModel.rangeConfig.splice(index, 1);
                }

                $controlFuns.addColumn = function () {
                    var configItem = {};
                    configItem.min = "0";
                    configItem.max = "1";
                    configItem.color = "#000000";

                    $scope.$parent.preModel.rangeConfig.push(configItem);
                }

                $controlFuns.apply = function () {
                    angular.copy($scope.$parent.preModel, $scope.model);
                    $scope.barStyle = getLinerStyle();
                    var units = groupByForColorBar(dataCache[$scope.model.sheet], function (item) {
                        return item[$scope.model.unitColumn];
                    });
                    $scope.ranking = getSortedArray(units);
                }

                var sheets = undefined;
                $controlFuns.getSheets = function () {
                    if (!sheets && dataCache) {
                        sheets = Object.keys(dataCache);
                    }
                    return sheets;
                }
            },
            templateUrl: '/js/directives/templates/waterProgressChart.html',
            replace: true
        };
    });
});
