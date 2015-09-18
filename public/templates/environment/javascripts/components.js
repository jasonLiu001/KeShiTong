/**
 * Created by Jacky on 7/27/2015.
 */
//var comps = angular.module('components', ['dataFactory']);

app.directive('clientFullTime', function () {
    return {
        restrict: 'E',
//            transclude: true,
        scope: {},
        controller: function ($scope, $interval) {
            var days = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
            $interval(function () {
                var dateNow = new Date();
                $scope.year = dateNow.getFullYear();
                $scope.month = dateNow.getMonth() + 1;
                $scope.date = dateNow.getDate();
                $scope.day = days[dateNow.getDay()];
                $scope.time = (dateNow.getHours()) + ":"
                    + (dateNow.getMinutes() < 10 ? "0" + dateNow.getMinutes() : dateNow.getMinutes()) + ":"
                    + (dateNow.getSeconds() < 10 ? "0" + dateNow.getSeconds() : dateNow.getSeconds());
            }, 1000);
        },
        template: '<div class="time"><span class="val" ng-bind="year"></span>' +
        '<span class="text">年</span>' +
        '<span class="val" ng-bind="month"></span>' +
        '<span class="text">月</span>' +
        '<span class="val" ng-bind="date"></span>' +
        '<span class="text">日</span>&nbsp;' +
        '<span class="text" ng-bind="day"></span>&nbsp;' +
        '<span class="val" ng-bind="time"></span></div>',
        replace: true
    };
});

app.directive('blocksChart', function () {
    return {
        restrict: 'E',
        scope: {
            title: '@'
        },
        controller: function ($scope) {
            var cfg = {
                ph: [{min: 8, max: 9}, {min: 6, max: 7}, {min: 4, max: 5}, {min: 2, max: 3}, {min: 0, max: 1}],
                suspended_solid: [{min: 0.8, max: 0.9}, {min: 0.6, max: 0.7}, {min: 0.4, max: 0.5}, {
                    min: 0.2,
                    max: 0.3
                }, {min: 0, max: 0.1}],
                cod: [{min: 201, max: 250}, {min: 151, max: 200}, {min: 101, max: 150}, {min: 50, max: 100}, {
                    min: 0,
                    max: 50
                }],
                plumbum: [{min: 0.8, max: 0.9}, {min: 0.6, max: 0.7}, {min: 0.4, max: 0.5}, {
                    min: 0.2,
                    max: 0.3
                }, {min: 0, max: 0.1}],
                mercury: [{min: 0.8, max: 0.9}, {min: 0.6, max: 0.7}, {min: 0.4, max: 0.5}, {
                    min: 0.2,
                    max: 0.3
                }, {min: 0, max: 0.1}]
            };
            $scope.toggleEditMode = function () {
                var obj = $(event.target).closest("div.info_Content");
                obj.find(".info_Title").toggle();
                obj.find('input').toggleClass("editing").focus();
            }
            $scope.editOnEnter = function () {
                if (event.keyCode == 13) {
                    $scope.toggleEditMode();
                }
            }
            $scope.legendColors = ['#F7412C', '#FF7E7E', '#B9CCF7', '#789EEF', '#4666C9'];
            $scope.pollution_degree = 0;
            $scope.categories = [
                {id: 'ph', name: 'PH值', colors: []},
                {id: 'suspended_solid', name: '悬浮物', colors: []},
                {id: 'cod', name: '化学需氧量', colors: []},
                {id: 'plumbum', name: '总铅', colors: []},
                {id: 'mercury', name: '总汞', colors: []}
            ];
            $scope.$on('dataReady', function (d, data) {
                for (var i = 0, cate; cate = $scope.categories[i]; i++) {
                    cate.colors.splice(0);
                    var sumResult = 0, sumPollution = 0;
                    for (var j = 0, ci; ci = data[j]; j++) {
                        sumResult += parseFloat(ci[cate.id]);
                        sumPollution += parseFloat((ci.pollution_degree));
                    }
                    var avgResult = (sumResult / data.length).toFixed(1);
                    $scope.pollution_degree = parseInt((sumPollution / data.length).toFixed(0));
                    var _cfg = cfg[cate.id];
                    for (var k = 0; k < _cfg.length; k++) {
                        if (avgResult >= _cfg[k].min && avgResult <= _cfg[k].max)
                            cate.colors.push($scope.legendColors[k]);
                        else cate.colors.push("transparent");
                    }
                }
            });
        },
//        link: function($scope, $elem, $attrs){
//        },
        template: '<div class="info_Content">' +
        '<div class="info_Title" ng-bind="title" ng-dblclick="toggleEditMode()"></div>' +
        '<input class="edit info_Title" ng-model="title" ng-keyup="editOnEnter()"/>' +
        '<div class="info_Text">' +
        '<ul class="c-frame">' +
        '    <li>' +
        '        <ul class="c-levels">' +
        '            <li ng-repeat="color in legendColors" ng-class="(legendColors.length - $index) == pollution_degree ? \'c-selected\' : \'\'" ng-style="{\'background-color\':color}"></li>' +
        '        </ul>' +
        '    </li>' +
        '    <li></li>' +
        '    <li ng-repeat="cate in categories">' +
        '        <ul class="c-levels" id="{{cate.id}}">' +
//                    '            <li ng-repeat="color in config.colors" data-color="{{color}}" ng-style="{\'background-color\':getColor(cate.id, $index)}"></li>' +
        '            <li ng-repeat="color in cate.colors track by $index" ng-style="{\'background-color\':color}"></li>' +
        '        </ul>' +
        '    </li>' +
        '</ul>' +
        '<ul class="c-frame c-title">' +
        '   <li>总指标</li>' +
        '   <li>|</li>' +
        '   <li ng-repeat="cate in categories" ng-bind="cate.name"></li>' +
        '</ul>' +
        '</div>' +
        '</div>',
        replace: true
    };
});

app.directive('waterProgressChart', function () {
    return {
        restrict: 'E',
        scope: {
            title: '@'
        },
        controller: function ($scope, $filter) {
            $scope.toggleEditMode = function () {
                var obj = $(event.target).closest("div.info_Content");
                obj.find(".info_Title").toggle();
                obj.find('input').toggleClass("editing").focus();
            }
            $scope.editOnEnter = function () {
                if (event.keyCode == 13) {
                    $scope.toggleEditMode();
                }
            }
            $scope.levelConfig = {
                '1': {scope: [0, 50], name: '优'},
                '2': {scope: [51, 100], name: '良'},
                '3': {scope: [101, 200], name: '轻度污染'},
                '4': {scope: [201, 300], name: '中度污染'},
                '5': {scope: [301, 9999999999], name: '重度污染'}
            };
            $scope.levelCount = 5;
            $scope.ranking = [];
            $scope.$on('dataReady', function (d, data) {
                $scope.ranking.splice(0);
                var array = [], obj = {};
                for (var i = 0, d; d = data[i]; i++) {
                    var _obj = {"area": d.area, "count": 1, "pollution_degree": parseInt(d.pollution_degree)};
                    if (!obj.hasOwnProperty(d.area)) {
                        obj[d.area] = 1;
                        array.push(_obj);
                    }
                    else {
                        _obj = $.grep(array, function (item) {
                            return item.area == d.area;
                        })[0];
                    }
                    _obj.count++;
                    _obj.pollution_degree += parseInt(d.pollution_degree);
                    _obj.avg = Math.round(_obj.pollution_degree / _obj.count);
                    _obj.styleLeft = (100 / $scope.levelCount) * _obj.avg + '%';
                }

                $scope.ranking = array;
            });
        },
        template: '<div class="info_Content">' +
        '<div class="info_Title" ng-bind="title" ng-dblclick="toggleEditMode()"></div>' +
        '<input class="edit info_Title" ng-model="title" ng-keyup="editOnEnter()"/>' +
        '   <div class="info_Text">' +
        '       <ul class="water-progress-chart">' +
        '           <li ng-repeat="item in ranking | orderBy: [\'-avg\', \'area\'] | limitTo: 5">' +
        '               <span ng-bind="item.area" title="{{item.area}}"></span>' +
        '               <div>' +
        '                   <div ng-style="{\'left\': item.styleLeft}"><img ng-src="{{\'images/\' + item.avg + \'.png\'}}" title="{{levelConfig[item.avg].name}}"/></div>' +
        '               </div>' +
        '               <span class="degree" ng-bind="item.count"></span>' +
        '           </li>' +
        '       </ul>' +
        '   </div>' +
        '</div>',
        replace: true
    };
});

app.directive('roseChart', function (dataFactory) {
    return {
        restrict: 'E',
        scope: {
            title: '@'
        },
        controller: function ($scope) {
            var array = [], obj = {};
            $scope.toggleEditMode = function () {
                var obj = $(event.target).closest("div.info_Content");
                obj.find(".info_Title").toggle();
                obj.find('input').toggleClass("editing").focus();
            }
            $scope.editOnEnter = function () {
                if (event.keyCode == 13) {
                    $scope.toggleEditMode();
                }
            }
            $scope.config = [
                {id: 1, name: '优'},
                {id: 2, name: '良'},
                {id: 3, name: '轻度污染'},
                {id: 4, name: '中度污染'},
                {id: 5, name: '重度污染'}
            ];

            Array.prototype.groupBy = function (f) {
                var self = this;
                var groups = {};
                self.forEach(function (o) {
                    var group = f(o);
                    groups[group] = groups[group] || [];
                    groups[group].push(o);
                });

                return Object.keys(groups).map(function (group) {
                    var item = $scope.config.filter(function (i) {
                        return i.id == group;
                    })[0];

                    var result = {key: item.name, value: groups[group]};
                    return result;
                })
            };

            function createChart(chart, data) {
                var option = {
                    toolbox: {
                        show: false
                    },
                    color: ['#4666C9', '#789EEF', '#B9CCF7', '#FF7E7E', '#F7412C'],
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
                                        textStyle: {color: 'black'},
                                        formatter: "{a} {b} ({d}%)"
                                    },
                                    labelLine: {
                                        show: true,
                                        lineStyle: {
                                            color: 'black'
                                        },
                                        length: 1
                                    }
                                }
                            },
                            data: data
                        }
                    ]
                };
                chart.setOption(option);
            }

            $scope.$on('dataReady', function (d, data) {
                    var chart = echarts.init(document.getElementById('rose-chart-container'));
                    var group = data.groupBy(function (item) {
                        return item.pollution_degree;
                    });

                    var _data = [];
                    for (var i = 0; i < group.length; i++) {
                        var groupItem = group[i];
                        var result = (groupItem.value.length / data.length * 100);
                        _data.push({name: groupItem.key, value: result});
                    }
                    createChart(chart, _data);
                }
            );
        },
        template: '<div class="info_Content">' +
        '<div class="info_Title" ng-bind="title" ng-dblclick="toggleEditMode()"></div>' +
        '<input class="edit info_Title" ng-model="title" ng-keyup="editOnEnter()"/>' +
        '   <div class="info_Text">' +
        '       <div id="rose-chart-container" style="width:360px;height:150px;"></div>' +
        '   </div>' +
        '</div>',
        replace: true
    };
});

app.directive('legend', function () {
    return {
        restrict: 'E',
        scope: {title: '@'},
        controller: function ($scope) {
            $scope.levels = [
                {className: 'l5', text: '5级-重度污染'},
                {className: 'l4', text: '4级-中度污染'},
                {className: 'l3', text: '3级-轻度污染'},
                {className: 'l2', text: '2级-良'},
                {className: 'l1', text: '1级-优'}
            ]
        },
        template: '<div class="right_Filter">' +
        '    <div ng-bind="title"></div>' +
        '    <ul>' +
        '        <li ng-repeat="level in levels" ng-class="level.className" ng-bind="level.text"></li>' +
        '    </ul>' +
        '</div>'
    };
});

app.directive('timeline', function () {
    return {
        restrict: 'E',
        scope: {title: '@'},
        controller: function ($scope,$interval) {
            $scope.times = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
            $scope.leftPosition = 0;
            $scope.currHour = 0;
            $scope.isMoveing = false;
            var interVal;
            $scope.moveTime = function (index) {
                $scope.leftPosition = index * 32 + 5 + 'px';
                $scope.currHour = index;//0,1,2,3,4,5,6
                $scope.$emit('filterByTime', '2015-07-14  ' + $scope.times[index] + ':00:00');
            }

            $scope.autoMove = function () {
                $scope.isMoveing = !$scope.isMoveing;
                if ($scope.isMoveing) {
                    interVal = $interval(function () {
                        $scope.currHour+=1;
                        if($scope.currHour>11)
                        {
                            $scope.currHour=0;
                        }
                        $scope.moveTime($scope.currHour);

                    }, 2000);
                }
                else {
                    $interval.cancel(interVal);
                }

            }


        },
        template: '<div class="bottom_Time">' +
        '   <div class="switch_Time">' +
        '        <ul>' +
        '           <li ng-repeat="time in times" class="$index == 0 ? currHour : \'\'" ng-bind="time" ng-click="moveTime($index)"></li>' +
        '        </ul>' +
        '   <div id="current_Time" class="current_Time animate-move-time" ng-style="{\'left\': leftPosition}"></div>' +
        '<div ng-class="{move_Stop:!isMoveing,move_Auto:isMoveing}" ng-click="autoMove()"></div>' +
        '</div>'
    };
});

app.directive('mapGis', function () {
    return {
        restrict: 'E',
        replace: true,
        //scope: {
        //    switchBaseMap:"&"
        //},
        controller: function ($scope) {
            $scope.map;
            $scope.currentBasemap = [];
            $scope.mapConfig = {
                center: [114.4995, 38.1108]
            };
            $scope.areaFeatures;//行政区域边线
            $scope.levelColors = ['#ff0000', '#789eef', '#b9ccf7', '#ff7e7e', '#f6412c'];
            $scope.levelRgbaColors = [[255, 255, 255, .6], [255, 0, 0, .6], [120, 158, 239, .6], [185, 204, 247, .6], [255, 126, 126, .6], [246, 65, 44, .6]];


            $scope.$on('dataReady', function (d, data) {

                var array = [], obj = {};
                for (var i = 0, d; d = data[i]; i++) {
                    var _obj = {
                        "area": d.area,
                        "count": 1,
                        "pollution_degree": parseInt(d.pollution_degree),
                        "area_pointX": d.area_pointX,
                        "area_pointY": d.area_pointY
                    };
                    if (!obj.hasOwnProperty(d.area)) {
                        obj[d.area] = 1;
                        array.push(_obj);
                    }
                    else {
                        _obj = $.grep(array, function (item) {
                            return item.area == d.area;
                        })[0];
                    }
                    _obj.count++;
                    _obj.pollution_degree += parseInt(d.pollution_degree);
                    _obj.level = Math.round(_obj.pollution_degree / _obj.count);
                }


                if ($scope.map) {
                    $scope.map.DrawLayerByData(array);
                    $scope.map.DrawAreaNameByData(array);
                    //$scope.map.DrawCompanyByData(data);
                    $scope.map.DrawTagsByData("", data);
                }
            });

            $scope.switchBaseMap = function (layerName) {
                if (layerName == 'default') {
                    $scope.map.removeAllLayers();
                    $scope.map.AddDefaultLayer();
                }
                else {
                    $scope.map.removeAllLayers();
                    $scope.map.setBasemap(layerName)
                }
            }
        },
        link: function ($scope) {

            require(["esri/map",
                    "esri/layers/ArcGISTiledMapServiceLayer",
                    "esri/geometry/Point",
                    "esri/SpatialReference",
                    "esri/graphic",
                    "esri/InfoTemplate",
                    "esri/layers/FeatureLayer",
                    "esri/symbols/SimpleLineSymbol",
                    "esri/symbols/SimpleFillSymbol",
                    "esri/renderers/SimpleRenderer",
                    "esri/symbols/PictureMarkerSymbol",
                    "esri/Color",
                    "esri/tasks/query",
                    "esri/tasks/QueryTask",
                    "esri/symbols/Font",
                    "esri/symbols/TextSymbol",
                    "dojo/domReady!"],
                function (Map, Tiled, Point, SpatialReference, Graphic, InfoTemplate, FeatureLayer, SimpleLineSymbol, SimpleFillSymbol, SimpleRenderer, PictureMarkerSymbol, Color, Query, QueryTask, Font, TextSymbol) {
                    $scope.map = new Map("map_Content", {
                        center: $scope.mapConfig.center,
                        zoom: 9,
                        slider: false,
                        logo: false,
                        //basemap:'satellite'//卫星satellite、灰色gray、dark-gray
                    });


                    //$scope.layer=
                    //添加区域高亮
                    var query = new Query();
                    query.outFields = ["*"];
                    query.returnGeometry = true;
                    query.where = "1=1";
                    query.outSpatialReference = $scope.map.spatialReference;
                    var queryTask = new QueryTask("http://202.85.212.14:6080/arcgis/rest/services/VectorMaps_China/ShiJiaZhuang/FeatureServer/1");
                    queryTask.execute(query, showResult);

                    function showResult(featureSet) {
                        $scope.areaFeatures = featureSet.features;

                    }

                    $scope.map.AddDefaultLayer = function () {
                        var tiledall = new Tiled("http://202.85.212.14:6080/arcgis/rest/services/StreetMaps_China11/China_Google_Street_11/MapServer", {showAttribution: false});
                        $scope.map.addLayer(tiledall);
                        var tiledsjz = new Tiled("http://202.85.212.14:6080/arcgis/rest/services/StreetMaps_China/ShiJiaZhuang_Google_17/MapServer", {showAttribution: false});
                        $scope.map.addLayer(tiledsjz);
                    }
                    $scope.map.AddDefaultLayer();
                    //外部调用方法
                    //行政区域层
                    $scope.map.DrawLayerByData = function (data) {
                        if ($scope.areaFeatures != null) {
                            $scope.map.graphics.clear();
                            dojo.forEach($scope.areaFeatures, function (feature) {
                                var graphic = feature;
                                var aname = feature.attributes.NAME;

                                var gArea = $.grep(data, function (area) {
                                    return area.area == aname;
                                });
                                var areaColor;

                                if (gArea.length == 0) {
                                    areaColor = new Color([255, 255, 255, .6]);
                                }
                                else {
                                    areaColor = new Color($scope.levelRgbaColors[gArea[0].level]);
                                }

                                var symbol = new SimpleFillSymbol(
                                    SimpleFillSymbol.STYLE_SOLID,
                                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 255]), 1),
                                    areaColor);

                                graphic.setSymbol(symbol);
                                //graphic.setAttributes({gtype:'area'});
                                //graphic.setInfoTemplate(infoTemplate);
                                $scope.map.graphics.add(graphic);
                            });
                        }
                        else {
                            //queryTask.execute(query, showResult);
                        }
                    }
                    //显示行政区域名称
                    $scope.map.DrawAreaNameByData = function (data) {
                        if (data) {
                            var font = new Font("14px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
                            for (var i = 0; i < data.length; i++) {
                                var pointx = parseFloat(data[i].area_pointX);
                                var pointy = parseFloat(data[i].area_pointY);
                                //   var pt=new Point(pointx,pointy,$scope.map.spatialReference);
                                var pt = new Point(pointx, pointy, new SpatialReference({wkid: 4326}));
                                var textSymbol = new TextSymbol(data[i].area, font, new Color([0, 0, 0]));
                                var graphic = new Graphic(pt, textSymbol);
                                graphic.setAttributes({gtype: 'adm'});
                                $scope.map.graphics.add(graphic);
                            }
                        }
                    }
                    //企业名称
                    $scope.map.DrawCompanyByData = function (data) {
                        if (data) {
                            var font = new Font("14px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
                            for (var i = 0; i < data.length; i++) {
                                var pointx = parseFloat(data[i].company_pointX);
                                var pointy = parseFloat(data[i].company_pointY);
                                //   var pt=new Point(pointx,pointy,$scope.map.spatialReference);
                                var pt = new Point(pointx, pointy, new SpatialReference({wkid: 4326}));
                                var textSymbol = new TextSymbol(data[i].company, font, new Color([0, 0, 0]));
                                var graphic = new Graphic(pt, textSymbol);
                                graphic.setAttributes({gtype: 'com'});
                                $scope.map.graphics.add(graphic);
                            }
                        }
                    };
                    //图标
                    var picUrl = "./images/ico_building.png";
                    //var picUrl="http://uxrepo.com/static/icon-sets/windows/svg/pin.svg";
                    //picUrl="http://pic34.nipic.com/20131019/10262474_122245177000_2.gif";
                    $scope.map.DrawTagsByData = function (tagUrl, data) {
                        if (data) {
                            var font = new Font("14px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);

                            for (var i = 0; i < data.length; i++) {
                                var pointx = parseFloat(data[i].company_pointX);
                                var pointy = parseFloat(data[i].company_pointY);
                                //   var pt=new Point(pointx,pointy,$scope.map.spatialReference);
                                var pt = new Point(pointx, pointy, new SpatialReference({wkid: 4326}));
                                var textSymbol = new TextSymbol(data[i].company, font, new Color([0, 0, 0]));

                                var symbol = new PictureMarkerSymbol(picUrl, 50, 50);
                                symbol.setOffset(0, 32);
                                var graphic = new Graphic(pt, symbol);
                                var infoTemplate = new InfoTemplate("企业信息", "企业名称:" + data[i].company + "<br>Ph值：" + data[i].ph);
                                //graphic.setInfoTemplate(infoTemplate);
                                graphic.setAttributes({gtype: 'tags',company:data[i].company});
                                $scope.map.graphics.add(graphic);
                            }
                        }
                    }

                    //删除包含某属性的图层
                    $scope.map.ClearGrapicsByAttr = function (attrName) {
                        for (var i = $scope.map.graphics.graphics.length - 1; i > 0; i--) {
                            if ($scope.map.graphics.graphics[i].attributes.gtype == attrName) {
                                $scope.map.graphics.remove($scope.map.graphics.graphics[i]);
                            }
                        }
                    }
                    $scope.map.on("load",function(){
                        $scope.map.graphics.on("mouse-over", function (e) {

                            if(e.graphic.attributes.gtype=='tags'){
                            //$scope.map.infoWindow.setFeatures([e.graphic]);
                            $scope.map.infoWindow.setContent(e.graphic.attributes.company);
                            $scope.map.infoWindow.show(e.mapPoint);
                            }
                        });
                        $scope.map.graphics.on("mouse-out", function (e) {
                                $scope.map.infoWindow.hide();
                        });
                    });
                });
        },
        template: '<div id="map_Content"></div>'
    };
});