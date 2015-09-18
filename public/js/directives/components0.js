define(['app', 'jquery'], function (app, $) {
    app.directive('clientFullTime', function () {
        return {
            restrict: 'E',
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
            restrict: 'A',
            scope: {
                model: '@',
                edit: '@'
            },
            controller: function ($scope) {
                var cfg = {
                    ph: [{ min: 10, max: 11 },{ min: 8, max: 9 }, { min: 6, max: 7 }, { min: 4, max: 5 }, { min: 2, max: 3 }, { min: 0, max: 1 }],
                    suspended_solid: [{ min: 0.9, max: 1.0 },{ min: 0.8, max: 0.9 }, { min: 0.6, max: 0.7 }, { min: 0.4, max: 0.5 }, {
                        min: 0.2,
                        max: 0.3
                    }, { min: 0, max: 0.1 }],
                    cod: [{ min: 251, max: 300 },{ min: 201, max: 250 }, { min: 151, max: 200 }, { min: 101, max: 150 }, { min: 50, max: 100 }, {
                        min: 0,
                        max: 50
                    }],
                    plumbum: [{ min: 0.9, max: 1.0 },{ min: 0.8, max: 0.9 }, { min: 0.6, max: 0.7 }, { min: 0.4, max: 0.5 }, {
                        min: 0.2,
                        max: 0.3
                    }, { min: 0, max: 0.1 }],
                    mercury: [{ min: 0.9, max: 1.0 },{ min: 0.8, max: 0.9 }, { min: 0.6, max: 0.7 }, { min: 0.4, max: 0.5 }, {
                        min: 0.2,
                        max: 0.3
                    }, { min: 0, max: 0.1 }]
                };

                $scope.model = undefined;

                $scope.$on('blocks-chart-ready', function (d, data) {
                    $scope.model = data.control.model;
                });

                $scope.$on('dataReady', function (d, data) {
                    for (var i = 0, cate; cate = $scope.model.categories[i]; i++) {
                        cate.colors = [];
                        var sumResult = 0, sumPollution = 0;
                        for (var j = 0, ci; ci = data[j]; j++) {
                            sumResult += parseFloat(ci[cate.id]);
                            sumPollution += parseFloat((ci.pollution_degree));
                        }
                        var avgResult = (sumResult / data.length).toFixed(1);
                        //$scope.pollution_degree = parseInt((sumPollution / data.length).toFixed(0));
                        var _cfg = cfg[cate.id];
                        for (var k = 0; k < _cfg.length; k++) {
                            if (avgResult >= _cfg[k].min && avgResult <= _cfg[k].max)
                                cate.colors.push($scope.model.legendColors[k]);
                            else cate.colors.push("transparent");
                        }
                    }
                });
            },

            template: '<div class="info_Content">' +
            '<div class="info_Title" ng-bind="model.title"></div>' +
            '<div class="info_Text">' +
            '<ul class="c-frame">' +
            '    <li>' +
            '        <ul class="c-levels">' +
            '            <li ng-repeat="color in model.legendColors" ng-class="(legendColors.length - $index) == pollution_degree ? \'c-selected\' : \'\'" ng-style="{\'background-color\':color}"></li>' +
            '        </ul>' +
            '    </li>' +
            '    <li></li>' +
            '    <li ng-repeat="cate in model.categories">' +
            '        <ul class="c-levels" id="{{cate.id}}">' +
            '            <li ng-repeat="color in cate.colors track by $index" ng-style="{\'background-color\':color}"></li>' +
            '        </ul>' +
            '    </li>' +
            '</ul>' +
            '<ul class="c-frame c-title">' +
            '   <li>总指标</li>' +
            '   <li>|</li>' +
            '   <li ng-repeat="cate in model.categories" ng-bind="cate.title"></li>' +
            '</ul>' +
            '</div>' +
            '</div>',
            replace: true
        };
    });

    app.directive('waterProgressChart', function () {
        return {
            restrict: 'A',
            scope: {
                model: '@'
            },
            controller: function ($scope) {

                $scope.model = undefined;

                $scope.$on('water-progress-chart-ready', function (d, data) {
                    $scope.model = data.control.model;
                });

                $scope.levelConfig = {
                    '1': { scope: [0, 50], name: '优' },
                    '2': { scope: [51, 100], name: '良' },
                    '3': { scope: [101, 150], name: '轻度污染' },
                    '4': { scope: [151, 200], name: '中度污染' },
                    '5': { scope: [201, 250], name: '重度污染' },
                    '6': { scope: [251, 999999999], name: '严重污染' }
                };
                $scope.ranking = [];
                var length = Object.keys($scope.levelConfig).length;
                $scope.$on('dataReady', function (d, data) {
                    $scope.ranking.splice(0);
                    var array = [], obj = {};
                    for (var i = 0, d; d = data[i]; i++) {
                        var _obj = { "area": d.area, "count": 1, "pollution_degree": parseInt(d.pollution_degree) };
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
                        _obj.styleLeft = (100 / length) * _obj.avg + '%';

                    }

                    $scope.ranking = array;
                });



            },
            template: '<div class="info_Content">' +
            '<div class="info_Title" ng-bind="model.title"></div>' +
            '   <div class="info_Text">' +
            '       <ul class="water-progress-chart">' +
            '           <li ng-repeat="item in ranking | orderBy: [\'-avg\', \'area\'] | limitTo: 5">' +
            '               <span ng-bind="item.area" title="{{item.area}}"></span>' +
            '               <div>' +
            '                   <div ng-style="{ \'left\' : item.styleLeft }"><img ng-src="{{\'images/\' + item.avg + \'.png\'}}" title="{{levelConfig[item.avg].name}}"/></div>' +
            '               </div>' +
            '               <span class="degree" ng-bind="item.count"></span>' +
            '           </li>' +
            '       </ul>' +
            '   </div>' +
            '</div>',
            replace: true
        };
    });


    //TODO: The logic of get and display data should be update
    app.directive('barChart', function () {
        return {
            restrict: 'A',
            scope: {
                model: '@',
                edit: '@'
            },
            controller: function ($scope, $element, $routeParams) {

                $scope.model = undefined;

                $scope.$on('bar-chart-ready', function (d, data) {
                    $scope.model = data.control.model;
                });


                function createChart(chart, data) {
                    var option = {
                        grid: {
                            x: 30,
                            y: 5,
                            x2: 30,
                            y2: 30

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
                                data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', "13", "14"]
                            }
                        ],
                        yAxis: [
                            {
                                type: 'value',
                                data: ['0', '5', '15', '20']
                            }
                        ],
                        series: [
                            {
                                type: 'bar',
                                data: data,
                                markLine: {
                                    data: [
                                        [{ name: '标准线', value: 15, xAxis: "1", yAxis: 15 },
                                            { name: '标准线', xAxis: '14', yAxis: 15 }]
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
                    chart.setOption(option);
                }

                var chart = echarts.init($element.children()[1].childNodes[0]);
                var _data =[];
                var mData = [];

                $scope.$on('dataReady', function (d, data) {
                    /* var group = data.groupBy(function (item) {
                     return item.pollution_degree;
                     });*/
                     mData = data;
                     _data =  [2.0, 4.9, 7.0, 3.2, 5.6, 6.7, 16.6, 12.2, 12.6, 2.0, 11.4, 3.3, 3.0, 4.1];
                     /*for (var i = 0; i < group.length; i++) {
                     var groupItem = group[i];
                     var result = (groupItem.value.length / data.length * 100);
                     _data.push({ name: groupItem.key, value: result });
                     }*/
                     createChart(chart, _data);
                 });


                 $scope.$watch("model.config", function () {
                 if (chart && _data.length) {
                    createChart(chart, _data);
                 }
                 }, true);

                $scope.mdataset = [
                    {name:"高锰酸钾", value:"0"},
                    {name:"氯化物", value:"1"},
                    {name:"氰化物", value:"2"}
                ];

                $scope.personChanged = function(obj) {

                    var selectedIndex = obj.value;
                    var tempData = [];
                    for (var i=0; i<14; i++)
                    {
                        if (mData[i] != null && mData[i] != undefined)
                        {
                            switch (selectedIndex){
                                case '0':
                                    tempData.push(mData[i].ph);
                                    break;
                                case '1':
                                    tempData.push(mData[i].plumbum)
                                    break;
                                case '2':
                                    tempData.push(mData[i].mercury)
                                    break;
                                default:
                                    tempData.push(mData[i].ph);
                                    break;
                            }
                        }
                    }
                    createChart(chart, tempData);
                }
            },
            template: '<div class="info_Content"><a href="javascript:;" ng-click="edit()" ng-if="showEdit()">编辑</a>' +
            '<div class="info_Title"><span class="titileSpan" ng-bind="model.title"></span>'+
            '<div class="barHSubContainer"><div class="dataValue"></div><span>指标值</span></div>' +
            '<div class="barHSubContainer"><div class="dataStander"></div><span>标准线</span></div><div class="barHSubContainer"><select ng-model="selectedObj" ng-options="person.name for person in mdataset" ng-change="personChanged(selectedObj)"></select></div></div>'+
            '   <div class="info_Text"><div id="bar-chart-container" style="width:360px;height:150px;"></div>' +
            '   </div>' +
            '</div>',
            replace: true
        };
    });

    app.directive('roseChart', function () {
        return {
            restrict: 'A',
            scope: {
                model: '@',
                edit: '@'
            },
            controller: function ($scope, $element, $routeParams) {

                $scope.model = undefined;

                $scope.$on('rose-chart-ready', function (d, data) {
                    $scope.model = data.control.model;
                });

                Array.prototype.groupBy = function (f) {
                    var self = this;
                    var groups = {};
                    self.forEach(function (o) {
                        var group = f(o);
                        groups[group] = groups[group] || [];
                        groups[group].push(o);
                    });

                    return Object.keys(groups).map(function (group) {
                        var item = $scope.model.config.filter(function (i) {
                            return i.id == group;
                        })[0];

                        var result = { key: item.name, value: groups[group] };
                        return result;
                    })
                };

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
                    var colors = $scope.model.config.select(function (item) { return item.color; });
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
                                            textStyle: { color: '#000' },
                                            formatter: "{a} {b} ({d}%)"
                                        },
                                        labelLine: {
                                            show: true,
                                            lineStyle: {
                                                color: '#000'
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

                var chart = echarts.init($element.children()[1].childNodes[0]);
                var _data = [];

                $scope.$on('dataReady', function (d, data) {
                    var group = data.groupBy(function (item) {
                        return item.pollution_degree;
                    });
                    _data = [];
                    for (var i = 0; i < group.length; i++) {
                        var groupItem = group[i];
                        var result = (groupItem.value.length / data.length * 100);
                        _data.push({ name: groupItem.key, value: result });
                    }
                    createChart(chart, _data);
                });


                $scope.$watch("model.config", function () {
                    if (chart && _data.length) {
                        createChart(chart, _data);
                    }
                }, true);


            },
            template: '<div class="info_Content">' +
            '<a href="javascript:;" ng-click="edit()" ng-if="showEdit()">编辑</a>' +
            '<div class="info_Title" ng-bind="model.title"></div>' +
            '   <div class="info_Text"><div id="rose-chart-container" style="width:360px;height:150px;"></div>' +
            '   </div>' +
            '</div>',
            replace: true
        };
    });

    app.directive('legendChart', function ($routeParams) {
        return {
            restrict: 'A',
            scope: {
                edit: '@',
                model: '@',
                showEdit : '='
            },
            controller: function ($scope) {

                $scope.model = undefined;

                $scope.$on('legend-chart-ready', function (d, data) {
                    $scope.model = data.control.model;
                });

                $scope.getColor = function(color){
                    return { color : color};
                }

                $scope.getBgColor = function(color){
                    return { "background-color" : color};
                }

            },
            template: '<div>' +
            '    <div ng-bind="model.title" class="lengedTitle"></div>' +
            '    <ul>' +
            '        <li ng-repeat="level in model.levels" >' +
                        '<span ng-style="getBgColor(level.color)" ng-class="model.legend"></span>' +
                        '<span ng-bind="level.text"></span>' +
            '</li>' +
            '    </ul>' +
            '</div>'
        };
    });

    app.directive('timeline', function () {
        return {
            restrict: 'E',
            scope :{},
            controller: function ($scope, $interval) {
                $scope.times = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
                $scope.leftPosition = 0;
                $scope.currHour = 0;
                $scope.isMoveing = false;
                var interVal;
                $scope.moveTime = function (index) {
                    $scope.leftPosition = index * 7 + 2 + '%';
                    $scope.currHour = index;//0,1,2,3,4,5,6
                    $scope.$emit('filterByTime', '2015-07-14  ' + $scope.times[index] + ':00:00');
                }

                $scope.autoMove = function () {
                    $scope.isMoveing = !$scope.isMoveing;
                    if ($scope.isMoveing) {
                        interVal = $interval(function () {
                            $scope.currHour += 1;
                            if ($scope.currHour > 11) {
                                $scope.currHour = 0;
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
            link: function ($scope) {
                $scope.map;
                $scope.currentBasemap = [];
                $scope.mapConfig = {
                    center: [114.4995, 38.1108]
                };
                var mapData={rdata:[],sdata:[]};//原始数据rdata,汇总数据sdata
                $scope.areaFeatures;//行政区域边线
                $scope.levelColors = ['#ff0000', '#789eef', '#b9ccf7', '#ff7e7e', '#f6412c'];
                $scope.levelRgbaColors = [[255, 255, 255, .6], [255, 0, 0, .6], [120, 158, 239, .6], [185, 204, 247, .6], [255, 126, 126, .6], [246, 65, 44, .6]];

                var initialMap=function(){
                    require(["esri/map",
                            "esri/layers/ArcGISTiledMapServiceLayer",
                            "esri/geometry/Point",
                            "esri/geometry/Circle",
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
                        function (Map, Tiled, Point,Circle,SpatialReference, Graphic, InfoTemplate, FeatureLayer, SimpleLineSymbol, SimpleFillSymbol, SimpleRenderer, PictureMarkerSymbol, Color, Query, QueryTask, Font, TextSymbol) {
                            $scope.map = new Map("map_Content", {
                                center: $scope.mapConfig.center,
                                zoom:8,
                                slider: false,
                                logo: false,
                                //basemap:'satellite'//卫星satellite、灰色gray、dark-gray
                            });

                            var query = new Query();
                            query.outFields = ["*"];
                            query.returnGeometry = true;
                            query.where = "1=1";
                            query.outSpatialReference = $scope.map.spatialReference;
                            var queryTask = new QueryTask("http://172.18.0.35:6080/arcgis/rest/services/Test/MapServer/1");
                            queryTask.execute(query, showResult);

                            function showResult(featureSet) {
                                $scope.areaFeatures = featureSet.features;
                            }

                            $scope.map.AddDefaultLayer = function () {
                              //  var turl="http://123.57.173.212:6080/arcgis/rest/services/StreetMap/ArcGIS_StreetMap_Gray_World_08/MapServer";
                               var turlchina="http://123.57.173.212:6080/arcgis/rest/services/StreetMap/Google_StreetMap_China_12/MapServer";

                                var tiledchina = new Tiled(turlchina, {showAttribution: false});
                                $scope.map.addLayer(tiledchina);

                                var urlword="http://123.57.173.212:6080/arcgis/rest/services/StreetMap/Google_StreetMap_NoLabel_World_08/MapServer";
                                var tiledword = new Tiled(urlword, {showAttribution: false});
                                $scope.map.addLayer(tiledword);

                                var  urlsjz="http://123.57.173.212:6080/arcgis/rest/services/StreetMap/Google_StreetMap_City_ShiJiaZhuang_17/MapServer";
                                var tiledsjz = new Tiled(urlsjz, { showAttribution: false });
                                $scope.map.addLayer(tiledsjz);


                            }
                            $scope.map.AddDefaultLayer();

                            //外部调用方法
                            //行政区域层
                            $scope.map.DrawLayerByData = function (data) {
                                if ($scope.areaFeatures != null) {
                                    if( $scope.map.graphics){
                                        $scope.map.graphics.clear();
                                    }
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
                                        var pt = new Point(pointx, pointy, new SpatialReference({ wkid: 4326 }));
                                        var textSymbol = new TextSymbol(data[i].area, font, new Color([0, 0, 0]));
                                        var graphic = new Graphic(pt, textSymbol);
                                        graphic.setAttributes({ gtype: 'adm' });
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
                                        var pt = new Point(pointx, pointy, new SpatialReference({ wkid: 4326 }));
                                        var textSymbol = new TextSymbol(data[i].company, font, new Color([0, 0, 0]));
                                        var graphic = new Graphic(pt, textSymbol);
                                        graphic.setAttributes({ gtype: 'com' });
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
                                        var pt = new Point(pointx, pointy, new SpatialReference({ wkid: 4326 }));
                                        var textSymbol = new TextSymbol(data[i].company, font, new Color([0, 0, 0]));

                                        var symbol = new PictureMarkerSymbol(picUrl, 50, 50);
                                        symbol.setOffset(0, 32);
                                        var graphic = new Graphic(pt, symbol);
                                        var infoTemplate = new InfoTemplate("企业信息", "企业名称:" + data[i].company + "<br>Ph值：" + data[i].ph);
                                        //graphic.setInfoTemplate(infoTemplate);
                                        graphic.setAttributes({ gtype: 'tags', company: data[i].company });
                                        $scope.map.graphics.add(graphic);
                                    }
                                }
                            }
                            //为企业画面积
                            $scope.map.DrawCompanyAreaByData=function(data){
                                if (data) {
                                    $scope.map.ClearGrapicsByAttr("comarea");
                                    for (var i = 0; i < data.length; i++) {
                                        var circleSymbol = new SimpleFillSymbol();
                                        circleSymbol.setColor(new Color([0, 0, 0, .7]));
                                        circleSymbol.outline.setColor(new Color([133, 133, 133, .5]));
                                        circleSymbol.outline.setWidth(0);
                                        var pX = parseFloat(data[i].company_pointX);
                                        var pY = parseFloat(data[i].company_pointY);
                                        var pD = parseFloat(data[i].pollution_degree) * 1000;
                                        var circle = new Circle({
                                            center: [pX, pY],
                                            geodesic: true,
                                            radius: pD
                                        });
                                        var graphic = new Graphic(circle, circleSymbol);
                                        graphic.setAttributes({gtype: 'comarea'});
                                        $scope.map.graphics.add(graphic);
                                    }
                                }
                            };

                            //删除包含某属性的图层
                            $scope.map.ClearGrapicsByAttr = function (attrName) {
                                for (var i = $scope.map.graphics.graphics.length - 1; i > 0; i--) {
                                    if ($scope.map.graphics.graphics[i].attributes.gtype == attrName) {
                                        $scope.map.graphics.remove($scope.map.graphics.graphics[i]);
                                    }
                                }
                            }

                            $scope.map.on("load", function () {
                                $scope.map.graphics.on("mouse-over", function (e) {

                                    if (e.graphic.attributes.gtype == 'tags') {
                                        //$scope.map.infoWindow.setFeatures([e.graphic]);
                                        $scope.map.infoWindow.setContent(e.graphic.attributes.company);
                                        $scope.map.infoWindow.show(e.mapPoint);
                                    }
                                });
                                $scope.map.graphics.on("mouse-out", function (e) {
                                    $scope.map.infoWindow.hide();
                                });

                                drayLayersByData();
                            });
                        });
                };


                var drayLayersByData=function(){

                    if ($scope.map) {
                        //$scope.map.DrawLayerByData(mapData.sdata);
                        $scope.map.DrawCompanyAreaByData(mapData.rdata);
                        //$scope.map.DrawAreaNameByData(mapData.sdata);
                        //$scope.map.DrawCompanyByData(data);
                        //$scope.map.DrawTagsByData("", mapData.rdata);
                    }
                }
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

                    mapData.rdata=data;
                    mapData.sdata=array;
                    drayLayersByData();
                });
                initialMap();
            },
            template: '<div id="map_Content" style="height:100%"></div>'
        };
    });

    app.directive('layoutTitle', function ($compile, $routeParams) {

        var template = {
            h1: '<div><h1 ng-bind="model.title" style="color:{{model.color}}"></h1> </div>',
            h2: '<div><h2 ng-bind="model.title" style="color:{{model.color}}"></h2> </div>',
            h3: '<div><h3 ng-bind="model.title" style="color:{{model.color}}"></h3> </div>',
            h4: '<div><h4 ng-bind="model.title" style="color:{{model.color}}"></h4> </div>',
            h5: '<div><h5 ng-bind="model.title" style="color:{{model.color}}"></h5> </div>',
            h6: '<div><h6 ng-bind="model.title" style="color:{{model.color}}"></h6> </div>',
            h7: '<div><h7 ng-bind="model.title" style="color:{{model.color}}"></h7> </div>',
        }

        var linker = function ($scope, $element) {

            $scope.showEdit = function () {
                return $routeParams.design == "design";
            };
            $scope.model = undefined;

            $scope.$on('layout-title-ready', function (d, data) {
                $scope.model = data.control.model;
                updateControl();
            });

            var updateControl = function () {
                var key = 'h' + $scope.model.fontSize;
                var html = template[key];
                $element.html(html).show();
                $compile($element.contents())($scope);
            }

            $scope.$watch("model", function () {
                updateControl();
            }, true);

            $scope.fontSizeOptions = [1, 2, 3, 4, 5, 6, 7]
        }

        return {
            restrict: 'A',
            replace: true,
            scope: {
                model: "@",
                edit: "@",
                fontSizeOptions: "@"
            },
            link: linker
        };

    });

    app.directive('tableChart', function ($routeParams) {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                model: "@",
                edit: "@",
                data: "@"
            },
            controller: function ($scope) {

                $scope.model = undefined;

                $scope.$on('table-chart-ready', function (d, data) {
                    $scope.model = data.control.model;
                });

                $scope.data = [
                    { sort: '1', name: '同心致远化工有限公司', cod: 14.23, ad: 46.96 },
                    { sort: '1', name: '迈尔斯通电子材料有限公司', cod: 13.20, ad: 23.57 },
                    { sort: '3', name: '河间市韩进宅热镀厂', cod: 12.02, ad: 59.67 },
                    { sort: '4', name: '河间市燕中电料厂', cod: 13.25, ad: 43.71 },
                    { sort: '5', name: '满城县海昌招纸厂', cod: 10.33, ad: 41.02 }
                ];
                $scope.$on('dataReady', function (d, data) {

                });
            },
            template:
            '<div class="info_Content">' +
                '<div class="info_Title" ng-bind="model.title"></div>' +
                '<div class="info_Text">' +
                '<table id="chart6" border="0" cellpadding="0" cellspacing="0">' +
                    '<tr>' +
                        '<td>排名</td>' +
                        '<td>企业名称</td>' +
                        '<td>COD(t)</td>' +
                        '<td>氨氮(t)</td>' +
                    '</tr>' +
                    '<tr ng-repeat="item in data">' +
                        '<td ng-bind="item.sort"></td>' +
                        '<td><img src="{{model.icon}}"><span ng-bind="item.name"></span></td>' +
                        '<td ng-bind="item.cod"></td>' +
                        '<td ng-bind="item.ad"></td>' +
                    '</tr>' +
                '</table>' +
                '</div>' +
            '</div>'
        }
    });

    app.directive('tabDir', function () {
        return {
            restrict: "E",
            replace: true,
            templateUrl: 'js/templates/layouts/tabDir.html',
            scope: {},
            controller: function ($scope) {
                $scope.tabsCurrId = $scope.$parent.current.id;
                $scope.tabsData = $scope.$parent.config.scenario;

                $scope.changeTab = function (id) {
                    $scope.tabsCurrId = $scope.$parent.current.id;
                    $scope.$emit("changeLayout", id);
                }
            }
        }
    });

    app.directive('zone', function ($compile,$routeParams) {

        var html =
            '<div class="zone">' +
                '<div ng-if="showEdit()" class="editorPanel">'+
                    '<a href="javascript:;" ng-click="edit()">编辑</a><span ng-bind="zone.id"></span>'+
                '</div>'+
                '<div class="zoneContent">' +

                '</div>'+
            '</div>';

        return {
            restrict: "E",
            replace: true,
            scope:{
              id:'@'
            },
            template:'<div></div>',
            controller: function ($scope,$element) {
                $scope.zone = undefined;
                var control = undefined;
                var init = function(){
                    var current = $scope.$parent.current;
                    for(var i = 0;i < current.zones.length;i++){
                        var z = current.zones[i];
                        if(z.id == $scope.id){
                            $scope.zone = z;
                            control = $scope.zone.control;
                            break;
                        }
                    }
                    var $obj =  $(html);
                    $obj.find('.zoneContent').attr(control.name,'')
                    $element.html($obj[0].outerHTML).show();
                    $compile($element.contents())($scope);

                    if($scope.zone){
                        var eventName = control.name + '-ready';//控件的事件名称是一个组合字符串
                        console.log('=====>' + eventName)
                        $scope.$broadcast(eventName, $scope.zone);//广播
                    }
                }

                $scope.showEdit = function () {
                    return $routeParams.design == "design";
                };

                $scope.edit = function () {
                    var templateFileName = control.name.replace(/\-/g,'');
                    var templUrl = '/js/templates/layouts/' + templateFileName +'.html' ;
                    $scope.$root.editTemplateUrl = templUrl;
                    $scope.$root.properties = control.model;
                    /*var data = {
                        templateUrl: control.editTemplateUrl,
                        properties: control.model
                    };*/
                    //$scope.$broadcast('controlEdit', data);

                }


                init();
            }
        }
    });
});