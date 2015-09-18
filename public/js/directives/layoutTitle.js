/**
 * Created by issuser on 2015/9/2.
 */
define(['app'], function (app) {
    app.directive('layoutTitle', function () {
        return {
            restrict: 'A',
            replace: true,
            scope:{},
            controller: function ($scope) {
                var cf = $scope.$parent.controlFuns = {};
                $scope.model = $scope.$parent.model;
                $scope.getClass = function () {
                    return "fontSize" + $scope.model.fontSize;
                }

                cf.apply = function () {
                    angular.copy($scope.$parent.preModel,$scope.model);
                }

                $scope.$on("destroy",function(){
                    $scope.$destroy();
                });
            },
            templateUrl: "/js/directives/templates/layoutTitle.html"
        };
    });
});