require(['app'],function(app){
    app.directive('legendChart', function () {
        return {
            restrict: 'A',
            replace: true,
            scope:{},
            controller: function ($scope) {
                $scope.model = $scope.$parent.model;
                var cf = $scope.$parent.controlFuns = {};

                $scope.getBgColor = function (color) {
                    return { "background-color": color };
                }

                cf.addLevel = function () {
                    $scope.$parent.preModel.levels.push({"color":"#000","text":""})
                }

                cf.removeLevel = function (index) {
                    $scope.$parent.preModel.levels.splice(index,1);
                }

                cf.apply = function () {
                    angular.copy($scope.$parent.preModel,$scope.model);
                }


                $scope.$on("destroy",function(){
                    $scope.$destroy();
                });
            },
            templateUrl: "/js/directives/templates/legendChart.html"
        };
    });
});