/**
 * Created by issuser on 2015/9/1.
 */
define(['app'], function (app) {
    app.directive('tableChart', function () {
        return {
            restrict: 'A',
            replace: true,
            scope:{},
            controller: function ($scope) {
                //编辑Panel中所需要的函数需要定义在controlFuns之下
                var cf = $scope.$parent.controlFuns = {};
                $scope.model = $scope.$parent.model;
                var dataCache = undefined;
                var titleLenght = 12;
                //var dataSchema = undefined;
                $scope.data = [];


                $scope.$on('dataReady', function (d, data) {
                    dataCache = data;
                    generateData();
                });

                $scope.$on("destroy",function(){
                    $scope.$destroy();
                });

                Array.prototype.count = function (f) {
                    var self = this;
                    var result = 0;
                    self.forEach(function (item) {
                        result += f(item);
                    });
                    return result;
                }

                function groupByDataForTableChart (array,f) {
                    var self = array;
                    var groups = {};
                    self.forEach(function (o) {
                        var group = f(o);
                        groups[group] = groups[group] || [];
                        groups[group].push(o);
                    });
                    return Object.keys(groups).map(function (group) {
                        var item = { name: group, columns:[]};
                        item.title =  group.length > titleLenght ? group.substring(0,titleLenght)+'...' : group;
                        var groupArray = groups[group];
                        for(var i= 0,col;col = $scope.model.columns[i];i++){
                            //col is  { "name":"so2","title":"SO2(t)","weight":0.95 } ..
                            var result = groupArray.count(function (item) {
                                return item[col.name] * col.weight;
                            }).toFixed(1);
                            item.columns.push(result);
                            item.orderByResult += result;
                        }
                        return item;
                    });
                }

                function generateData(){
                    $scope.data = groupByDataForTableChart(dataCache[$scope.model.sheet],function (item) {
                        return item[$scope.model.groupByColumn.name]
                    });
                }

                var minColumnLength = 1;
                var maxColumnLength = 3;

                cf.addColumn = function(){
                    if($scope.$parent.preModel.columns.length < maxColumnLength) {
                        $scope.$parent.preModel.columns.push({"name": "", "title": "", "weight": 1});
                    }
                }

                cf.removeColumn = function (index) {
                    if($scope.$parent.preModel.columns.length > minColumnLength){
                        $scope.$parent.preModel.columns.splice(index,1);
                    }
                }

                cf.apply = function () {
                    angular.copy($scope.$parent.preModel,$scope.model);
                    generateData();
                }


                cf.iconChange = function () {
                    $scope.$parent.preModel.icon = icons[cf.preIcon];
                }


                var icons = {
                    "水":"/images/ico_waterwarning.png",
                    "空气":"/images/ico_airwarning.png"
                };

                cf.preIcon = '';

                cf.getIcons = function () {
                    return Object.keys(icons).map(function (ic) {
                        if(icons[ic] == $scope.$parent.preModel.icon){
                            cf.preIcon = ic;
                        }
                        return ic;
                    });
                };

                var sheets = undefined;
                cf.getSheets = function () {
                    if(!sheets && dataCache){
                        sheets = Object.keys(dataCache);
                    }
                    return sheets;
                }



                cf.getDataSchema = function () {
                    //if(!dataSchema && dataCache ){
                    //    dataSchema = Object.keys(dataCache[0]);
                    //}
                    //return dataSchema;
                    if($scope.$parent.preModel.sheet) {
                        return Object.keys(dataCache[$scope.$parent.preModel.sheet][0]);
                    }
                }
            },
            templateUrl: "/js/directives/templates/tableChart.html"
        }
    });
});
