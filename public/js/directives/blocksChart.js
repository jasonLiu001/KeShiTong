define(['app','angular'], function (app,angular) {
    app.directive('blocksChart', function () {
        return {
            restrict: 'A',
            scope: {},
            controller: function ($scope,$element) {
                $scope.model = $scope.$parent.model;

                //获取当前作用域的父作用域，通常父作用域是zone指令中的$scope
                var cf = $scope.$parent.controlFuns = {};

                //var dataSchema = undefined;

                var dataCache = undefined;

                var initColorForColumn = function (column) {
                    column.colors = [];
                    var sumResult = 0, sumPollution = 0;
                    var sheet = dataCache[$scope.model.sheet];
                    for (var j = 0, ci; ci = sheet[j]; j++) {
                        sumResult += parseFloat(ci[column.name]);
                        sumPollution += parseFloat((ci[$scope.tModel.groupBy]));
                    }
                    var avgResult = parseFloat((sumResult / sheet.length).toFixed(1));
                    $scope.groupByColumn = parseInt((sumPollution / sheet.length).toFixed(0));
                    var _cfg = column.levels; //cfg[cate.id];
                    for (var k = 0; k < _cfg.length; k++) {
                        if (avgResult >= parseFloat(_cfg[k].min) && avgResult < parseFloat(_cfg[k].max)){  //[2 3)
                            column.colors.push($scope.tModel.legendColors[k]);
                        }
                        else {
                            column.colors.push({color:"transparent"});
                        }
                    }
                }

                $scope.$on('dataReady', function (d, data) {
                    dataCache = data;
                    apply();
                });

                $scope.$on("destroy",function(){
                    $scope.$destroy();
                });

                var apply = function () {
                    $scope.tModel = {};
                    angular.copy($scope.model,$scope.tModel);
                    $scope.tModel.legendColors.reverse();
                    for (var i = 0, column; column = $scope.tModel.columns[i]; i++) {
                        column.levels.reverse();
                        initColorForColumn(column)
                    }
                }

                cf.getDataSchema = function () {
                    //if(!dataSchema && dataCache ){
                    //    dataSchema = Object.keys(dataCache[$scope.model.sheet][0]);
                    //}
                    if($scope.$parent.preModel.sheet){
                        return Object.keys(dataCache[$scope.$parent.preModel.sheet][0]);;
                    }
                }


                var maxColorCount = 6; //color数量的最大值
                var minColorCount = 1; //color数量的最小值

                /**
                 * 增加Color
                 */
                cf.addColor = function () {
                    if($scope.$parent.preModel.legendColors.length < maxColorCount){
                        $scope.$parent.preModel.legendColors.push({ color:'#000'});
                        for(var i=0;i < $scope.$parent.preModel.columns.length;i++){
                            $scope.$parent.preModel.columns[i].levels.push({"min":0,"max":0});
                        }
                    }
                }

                /**
                 * 删除Color
                 */
                cf.removeColor = function (index) {
                    if($scope.$parent.preModel.legendColors.length > minColorCount) {
                        //var idx = this.$index;
                        $scope.$parent.preModel.legendColors.splice(index,1);
                        for(var i=0;i < $scope.$parent.preModel.columns.length;i++){
                            $scope.$parent.preModel.columns[i].levels.splice(index,1);
                        }
                    }
                }

                cf.changedSchema = function () {
                    var column = this.column;
                    initColorForColumn(column);
                }

                var maxColumnCount = 6;//column数量的最大值
                var minColumnCount = 1;//column数量的最小值

                /**
                 * 删除Column配置
                 */
                cf.removeColumn = function(index){
                    if($scope.$parent.preModel.columns.length > minColumnCount){
                        $scope.$parent.preModel.columns.splice(index,1);
                    }
                }

                /**
                 * 增加Column配置
                 */
                cf.addColumn = function(){
                    if($scope.$parent.preModel.columns.length < maxColumnCount){
                        var obj = { "name":"", "title":"", "levels":[] };
                        for(var i=0;i< $scope.$parent.preModel.legendColors.length;i++){
                            obj.levels.push({"min":0,"max":0});
                        }
                        $scope.$parent.preModel.columns.push(obj);
                    }
                }

                cf.apply = function () {
                    angular.copy($scope.$parent.preModel,$scope.model);
                    apply();
                }

                cf.columnWidth = function () {
                    var columnWidthCount = $element.find('.c-frame').width();
                    var columnFirstWidth = 45 ;//$element.find('.c-frame').first().find('li').first().width();
                    var result = (columnWidthCount - columnFirstWidth) / $scope.model.columns.length;
                    return result + 'px';
                }


                var sheets = undefined;
                cf.getSheets = function () {
                    if(!sheets && dataCache){
                        sheets = Object.keys(dataCache);
                    }
                    return sheets;
                }
            },
            templateUrl : "/js/directives/templates/blocksChart.html",
            replace: true
        };
    });

});