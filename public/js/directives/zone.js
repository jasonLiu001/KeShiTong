define(['app','angular','bootbox','draganddrop','angular-highlightjs'], function (app,angular,bootbox) {
    app.directive('zone', function ($compile, $routeParams) {

        bootbox.setLocale("zh_CN");

        var html =
            '<div class="zone">' +
            '<div ng-if="showEdit()" class="editorPanel">' +
            '<a ng-if="showSettings()" class="fa fa-edit" title="编辑"  data-toggle="modal" data-target="#editProperties_{{id}}" ng-click="showEditPanel()"></a>' +
            '<a ng-if="showSettings()" class="fa fa-times" title="删除" href="javascript:;" ng-click="delete()"></a><i class="fa fa-arrows zone-drag-handle" ></i>' +
            '</div>' +
            '<div class="zoneContent" drag-channel="{{zone.id}}" ui-on-drop="onDrop($event,$data)" drag-enter-class="on-drag-enter-custom"  >' +
            '</div>' +

            '<div class="modal fade" id="editProperties_{{id}}" tabindex="-1" role="dialog" aria-labelledby="myModalLabel_{{id}}" ng-if="showSettings()">' +
            '<div class="modal-dialog" role="document">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '<h4 class="modal-title" id="myModalLabel_{{id}}">{{zone.control.model.title}}</h4>' +
            '</div>' +
            '<div class="modal-body" ng-include="getEditTemplateUrl()"></div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>' +
            '<button type="button" class="btn btn-primary" ng-click="controlFuns.apply()">应用</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        // drop-channel="zone1,zone2,zone3" ui-draggable="true" drag="zone" on-drop-success="dropSuccessHandler($event)"

        return {
            restrict: "E",
            replace: true,
            scope: {
                id: '@'
            },
            template: '<div></div>',
            controller: function ($scope, $element) { //$element is jQuery object..
                $scope.zone = undefined;
                //var control = undefined;
                //var dataCache = undefined;

                $scope.controlFuns = {}; //控件编辑相关的操作方法
                $scope.preModel = {};

                /**
                 * 当点击编辑按钮时，将model复制给preModel,提供给控件的编辑模板.
                 */
                $scope.showEditPanel = function () {
                    $scope.preModel = angular.copy($scope.model);//model的暂存，因不想让更改直接反馈到要保存的数据，这些数据应在Apply之后再反馈到页面
                }

                /**
                 * 初始化zone
                 */
                var init = function () {
                    var layout = $scope.$parent.current;// $scope.$parent is layout directive,  current is layout JSON object
                    /**
                     * 第一次init的时候会从layout中获取zone，
                     */
                    if(!$scope.zone){
                        for (var i = 0,zone; zone = layout.zones[i]; i++) {
                            if (zone.id == $scope.id) {
                                $scope.zone = zone;
                                break;
                            }
                        }
                    }

                    $element.html(html);

                    /**
                     * 如果zone中有control才能添加control指令
                     */
                    if($scope.zone && $scope.zone.control){
                        if($scope.zone.control.name){
                            $scope.model = $scope.zone.control.model;
                            //编译指令前，添加control指令到html节点中
                            $element.find('.zoneContent').attr($scope.zone.control.name,'');//control.name
                        }
                    }else {
                        /**
                         * 如果zone为undefined，则初始化一个zone对象，并add到layout对象中的zones中，
                         * 出现这种情况，一般是在layout模板中手动添加了一个zone指令，而数据库中又没有这个指令配置
                         * @type {{id: 'zoneID,必须保证在同一个layout中，其id不能出现重复', control: {}}}
                         */
                        $scope.zone = {
                            id:$scope.id,
                            control:{}
                        };
                        layout.zones.push($scope.zone);
                    }
                    /**
                     * 编译指令
                     */
                    $compile($element.contents())($scope);
                }


                var updated = false;

                /**
                 * 拖放控件时触发的事件
                 * @param $event
                 * @param $data 可能来自rightPanel指令中的control对象，也可能来自其他zone指令中zone对象
                 */
                $scope.onDrop = function ($event, $data) {

                    if(confirm('此操作将会使用新的控件覆盖此区域的控件, 确实要覆盖吗?')){
                        if($data.control){ //来自zone

                        }else{ //来自rightPanel
                            $scope.zone.control = $data;
                            updated = true;
                        }
                    }
                }

                /**
                 * data is zone
                 */
                $scope.$on('updateZone', function (d, data) {
                    if(updated){
                        console.log($scope.zone.id);
                        try{
                            $scope.$broadcast('destroy',{});
                        }catch(e){

                        }
                        init();
                        window.setTimeout(function(){
                            $scope.$broadcast('dataReady', dataCache);
                        },300);

                        updated = false;
                    }
                });


                $scope.$on('dataReady', function (d, data) {
                    dataCache = data;
                });

                /**
                 * 是否显示编辑区域
                 * @returns {undefined|boolean}
                 */
                $scope.showEdit = function () {
                    return $routeParams.design == "design";
                };

                $scope.showSettings = function () {
                    //return $scope.zone.control.name == undefined ? false : true;
                    return $scope.zone.control&& $scope.zone.control.name && $scope.showEdit();
                }

                /**
                 * 获取控件的编辑模板URL
                 * @returns {string}
                 */
                $scope.getEditTemplateUrl = function () {
                    var templateFileName = $scope.zone.control.name.replace(/\-/g, '');
                    var templUrl = '/js/directives/templates/' + templateFileName + '_edit.html';
                    return templUrl;
                }
                $scope.delete = function () {
                    //if(confirm('确实要删除此区域中的控件吗?')){

                    bootbox.confirm({
                        title:"请确认",
                        message:"确实要删除此区域中的控件吗?",
                        callback: function(result) {
                            if(result){
                                var $zoneContent = $element.html(html).find('.zoneContent');
                                //编译指令前，删除相应属性
                                $zoneContent.removeAttr($scope.zone.control.name);
                                /**
                                 * 销毁control指令
                                 */
                                try{
                                    $scope.$broadcast('destroy');
                                }catch(e){
                                }

                                $scope.zone.control = {};

                                /**
                                 * 编译指令
                                 */
                                $compile($element.contents())($scope);
                            }
                        }
                    });


                    //}
                }


                init();
            }
        }
    });
});