/**
 * Created by issuser on 2015/8/11.
 */
define(['app', 'jquery'], function (app, $) {
    return app.directive('rightPanel', function () {
        return {
            templateUrl: '/js/directives/templates/rightPanel.html',
            replace: true,
            restrict: 'E',
            controller: function ($scope) {
                $scope.controls = [];
                $scope.scenario = {};
                //var dataCache = undefined;
                //
                //$scope.$on('dataReady', function (d, data) {
                //    dataCache = data;
                //});

                /**
                 * 当拖放控件之后触发的事件
                 * @param $event
                 */
                $scope.dropSuccessHandler = function ($event) {
                    //刷新，重新编译zone..
                    //alert('');
                    var self = this;
                    //alert('form rightPanel');
                    $scope.$broadcast('updateZone',self.control);

                    //$scope.$broadcast('dataReady',dataCache);


                }

                $scope.$on('controlsReady', function (d, controls) {
                    $scope.controls = controls;
                });

                //layoutReady
                $scope.$on('layoutReady', function (d, scenario) {
                    //$scope.zones = scenario.zones;
                    //$scope.layouts = scenario.layouts;
                    $scope.scenario = scenario;
                });

                $scope.changePageLayout = function () {
                    $scope.scenario.templateUrl = this.layout.templateUrl;
                    $scope.$broadcast('changeScenario', $scope.scenario.id);
                }

                $scope.show = true;

                $scope.autoHide = function () {
                    if ($("#rightListFrame").hasClass("rightIndent")) {
                        $("#rightPanel").css("width", "13px");
                        $("#rightListFrame").removeClass("rightIndent");
                        $("#rightListFrame").addClass("rightDecrease");
                        $("#rightMenu").hide();

                    } else {
                        $("#rightPanel").css("width", "168px");
                        $("#rightListFrame").removeClass("rightDecrease");
                        $("#rightListFrame").addClass("rightIndent");
                        $("#rightMenu").show();
                    }
                };

                //$scope.updateZone = function () {
                //    var self = this;
                //    var zone = self.zone;
                //    //var control = self.control;
                //    //self.control.name =
                //    var newZone = {
                //        "id": zone.id,
                //        "control": self.control
                //    };
                //    $scope.$broadcast('updateZone', newZone);
                //
                //}

                $('#tab4 > a').click(function () {
                    var self = $(this);
                    var expanded = self.attr('aria-expanded');
                    var i = self.find('i');
                    if (expanded == "false") {
                        i.removeClass('fa-plus-square').addClass('fa-minus-square');
                    } else {
                        i.removeClass('fa-minus-square').addClass('fa-plus-square');
                    }
                });
                $("#rightPanel").niceScroll();

            }
        };
    });
});