var areaData = [{
    name: '平山县',
    point: '113.888421,38.408101',
    level: 1
}, {
    name: '灵寿县',
    point: '114.295461,38.41172',
    level: 3
}, {
    name: '行唐县',
    point: '114.444939,38.550914',
    level: 1
}, {
    name: '新乐市',
    point: '114.741595,38.384573',
    level: 2
}, {
    name: '井陉矿区',
    point: '114.026401,38.083457',
    level: 1
}, {
    name: '鹿泉区',
    point: '114.309259,38.170656',
    level: 1
}, {
    name: '正定县',
    point: '114.527727,38.243241',
    level: 4
}, {
    name: '无极县',
    point: '114.902572,38.185178',
    level: 4
}, {
    name: '深泽县',
    point: '115.203828,38.206957',
    level: 2
}, {
    name: '井陉县',
    point: '114.074693,37.963387',
    level: 4
}, {
    name: '新华区',
    point: '114.417343,38.105266',
    level: 1
}, {
    name: '桥西区',
    point: '114.412744,38.05073',
    level: 3
}, {
    name: '桥东区',
    point: '114.504299,38.119007',
    level: 4
}, {
    name: '裕华区',
    point: '114.548424,38.027085',
    level: 3
}, {
    name: '石家庄长安区',
    point: '114.582919,38.107083',
    level: 3
}, {
    name: '藁城市',
    point: '114.794488,38.001612',
    level: 1
}, {
    name: '晋州市',
    point: '115.050053,38.040135',
    level: 2
}, {
    name: '辛集市',
    point: '115.223436,37.950305',
    level: 1
}, {
    name: '栾城县',
    point: '114.605915,37.906922',
    level: 3
}, {
    name: '元氏县',
    point: '114.408144,37.823055',
    level: 1
}, {
    name: '赵县',
    point: '114.782182,37.763566',
    level: 4
}, {
    name: '赞皇县',
    point: '114.270165,37.649546',
    level: 2
}, {
    name: '高邑县',
    point: '114.578319,37.625771',
    level: 1
}];
var levelColors = ['#ff0000', '#789eef', '#b9ccf7', '#ff7e7e', '#f6412c'];
var levelRgbaColors = [[255,255,255, .6],[255, 0, 0, .6], [120, 158, 239, .6], [185, 204, 247, .6], [255, 126, 126, .6], [246, 65, 44, .6]];

//??????
var map;
var mapConfig={
    center : [114.4995, 38.1108]
};
var pointData={features:null,centers:null};//行政区域边线&行政区域中心

function initArcGISMap() {

    require(["esri/map",
            "esri/layers/ArcGISTiledMapServiceLayer",
            "esri/geometry/Point",
            "esri/SpatialReference",
            "esri/graphic",
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
        function (Map, Tiled, Point,SpatialReference,Graphic, FeatureLayer, SimpleLineSymbol, SimpleFillSymbol, SimpleRenderer,PictureMarkerSymbol,Color, Query, QueryTask, Font, TextSymbol) {
            map = new Map("map_Content", {
                center: mapConfig.center,
                zoom: 9,
                logo: false,
                slider:false
            });
            var tiled = new Tiled("http://202.85.212.14:6080/arcgis/rest/services/StreetMaps_China11/China_Google_Street_11/MapServer", {showAttribution: false});
            map.addLayer(tiled);
            var tiled = new Tiled("http://202.85.212.14:6080/arcgis/rest/services/StreetMaps_China/ShiJiaZhuang_Google_17/MapServer", {showAttribution: false});
            map.addLayer(tiled);
            var layer=map.base

            //添加区域高亮
            var query = new Query();
            query.outFields = ["*"];
            query.returnGeometry = true;
            query.where = "1=1";
            query.outSpatialReference = map.spatialReference;
            var queryTask = new QueryTask("http://202.85.212.14:6080/arcgis/rest/services/VectorMaps_China/ShiJiaZhuang/FeatureServer/1");
            queryTask.execute(query, showResult);

            function showResult(featureSet) {
                pointData.features=featureSet.features;
            }

            var query1 = new Query();
            query1.outFields = ["*"];
            query1.returnGeometry = true;
            query1.where = "1=1";
            query1.outSpatialReference = map.spatialReference;

            var queryTask1 = new QueryTask("http://202.85.212.14:6080/arcgis/rest/services/VectorMaps_China/ShiJiaZhuang/FeatureServer/0");
            queryTask1.execute(query1, showResult1);

            function showResult1(featureSet) {
                pointData.centers=featureSet.features;
            }

            //外部调用方法
            map.DrawLayerByData=function(data){
                if(pointData.features!=null){
                    map.graphics.clear();
                    dojo.forEach(pointData.features, function (feature) {
                        var graphic = feature;
                        var aname = feature.attributes.NAME;

                        var gArea = $.grep(data, function (area) {
                            return area.name == aname;
                        });
                        var areaColor;

                        if (gArea.length == 0) {
                            areaColor = new Color([255, 255, 255, .6]);
                        }
                        else {
                            areaColor = new Color(levelRgbaColors[gArea[0].level]);
                        }

                        var symbol = new SimpleFillSymbol(
                            SimpleFillSymbol.STYLE_SOLID,
                            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 255]), 1),
                            areaColor);

                        graphic.setSymbol(symbol);
                        graphic.setAttributes({gtype:'arealayer'});
                        //graphic.setInfoTemplate(infoTemplate);
                        map.graphics.add(graphic);
                    });
                    map.DrawAreaName();
                }
                else{
                    //queryTask.execute(query, showResult);
                }
            }

            map.DrawTagsByData=function(tagUrl){
                if(pointData.centers!=null){
                    dojo.forEach(pointData.centers, function (feature) {
                        var symbol = new PictureMarkerSymbol("images/ico_water.png", 40, 40).setOffset(0,38);
                        map.graphics.add(new Graphic(feature.geometry, symbol));
                    });
                }
            }
            map.DrawCompanyByData=function(){
                var pt=new Point(114.309259,38.170656,new SpatialReference({ wkid: 4326 }));
                var font = new Font("14px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
                var textSymbol = new TextSymbol('石家庄市曲寨热点有限公司', font, new Color([0, 0, 0]));
                var textGraphic = new Graphic(pt,textSymbol);
                map.graphics.add(textGraphic);
            };
            map.ClearGrapicsByAttr=function(attrName){

                for(var i=map.graphics.graphics.length-1;i>0;i--){
                    if (map.graphics.graphics[i].attributes.gtype ==attrName) {
                        map.graphics.remove(map.graphics.graphics[i]);
                    }
                }

            }
            map.DrawAreaName=function(){
                if(pointData.centers!=null){
                    var font = new Font("14px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
                    dojo.forEach(pointData.centers, function (feature) {
                        var textSymbol = new TextSymbol(feature.attributes.name, font, new Color([0, 0, 0]));
                        var textGraphic = new Graphic(feature.geometry, textSymbol);
                        textGraphic.setAttributes({gtype:'areaname'});
                        map.graphics.add(textGraphic);
                    });
                }
            }
        });
}


//var defaultZoom = 10;

var zoomConfig = {
    minZoom: 4,
    maxZoom: 10
};

var currentPollType = 0;

//?????
$(function () {
    setInterval(function () {
        initialTime();
    }, 1000);


    $(".navi_Button").tabs({
        content: '.navi_Content',
        currentCss: "current",
        callback: function (i) {
            currentPollType = i;
            //addAreasAndOverlay();
        }
    });
    initArcGISMap();

    //????
    moveTime();
    switchButton();
});
//??
function initialTime() {
    var datenow = new Date();
    var year = datenow.getFullYear();
    var month = datenow.getMonth() + 1;
    var date = datenow.getDate();
    var hh = datenow.getHours();
    var mm = datenow.getMinutes();
    var ss = datenow.getSeconds();
    var days = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];


    if (mm < 10) {
        mm = "0" + mm;
    }
    if (ss < 10) {
        ss = "0" + ss;
    }

    $(".left_Content .top_Content .time span:eq(0)").text(year);
    $(".left_Content .top_Content .time span:eq(2)").text(month);
    $(".left_Content .top_Content .time span:eq(4)").text(date);
    $(".left_Content .top_Content .time span:eq(6)").text(days[datenow.getDay()]);
    $(".left_Content .top_Content .time span:eq(7)").text(hh + ":" + mm + ":" + ss);
}
//????????????
function addNameOverlay(content) {
    var overlay = null;
    if (currentPollType == 0) {
        overlay = new TooltipOverlay(content); //????????
    } else if (currentPollType == 1) {
        overlay = new RichOverlay(content); //??????
    } else {
        overlay = new RichOverlay(content); //????????
    }
    map.addOverlay(overlay);

}


function getWarterQualityData(datetime) {
    if (data) {
        var wData = $.grep(data, function (item) {
            if (item.inspect_time == datetime) {
                return item;
            }
        });
        for (var i = 0; i < wData.length; i++) {
            for (var j = 0; j < areaData.length; j++) {
                if (areaData[j].name.indexOf(wData[i].area) > -1) {
                    if (!areaData[j].factoryCount) {
                        areaData[j].factoryCount = 1;
                        areaData[j].sumDegree = 0;
                        areaData[j].pollution_degree = 0;
                    }

                    areaData[j].factoryCount += 1;
                    areaData[j].sumDegree += parseInt(wData[i].pollution_degree);
                    areaData[j].pollution_degree = Math.round(areaData[j].sumDegree / areaData[j].factoryCount);
                }
            }
        }
        return areaData;
    } else {
        return [];
    }
}
//
var winOpts = {
    width: 400,
    height: 300,
    //offset: new BMap.Size(25, 0),
    title: ''
}

//
function AddInfoWindow(content) {

    var html = "";
    if (currentPollType == 1) {
        html = "<div class='pop_Content'><div class='company'>????????????</div><div class='level_Content'><span class='l1'></span>2? - ?</div><div class='chart_Content'><div class='chart_Title'>?10???</div><div class='chart_Line'></div></div></div>";
    } else if (currentPollType == 2) {
        html = "<div class='pop_Content'><div class='serial'>?????NT-3243289</div><div><table><tr><td>???</td><td>Ph????(??)</td><td>???</td><td>X16</td></tr><tr><td>?????</td><td>???</td><td>??</td><td>???</td></tr><tr><td>?????</td><td>????......</td><td></td><td></td></tr></table></div><div class='chart_Content'><div class='chart_Title'>????</div><div class='chart_Line'></div></div></div>";
    }

    var infoWindow = new BMap.InfoWindow(html, winOpts);
    infoWindow.addEventListener("open", function () {

        var pData = [];

        for (var i = 0; i < 10; i++) {
            var cc = Math.floor(Math.random() * (15 - 0) + 0);
            pData.push(cc);
        }

        $(".pop_Content .chart_Line").lineChart({
            pCate: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            pData: [{
                data: pData,
                color: '#ff0000'
            }]
        });

    });
    $(".bottom_Positon").html("&nbsp;" + content.lat + "N &nbsp;" + content.lng + "E");
    //map.openInfoWindow(infoWindow, content);
}

function dragTime() {
    var move = false;
    var offLeft = $(".switch_Time").offset().left + 10;
    $("#current_Time").mousedown(function (e) {
        move = true;
    });
    $(document).mousemove(function (e) {
        if (move) {
            var x = e.pageX - offLeft;
            if (x > 4 && x < 390) {
                $("#current_Time").css("left", x);
            }
        }
    }).mouseup(function (e) {
        move = false;
    });
}

function moveTime() {
    $(".switch_Time>ul>li").click(function () {
        var ind = $(this).index();
        try {
            window.stop();
        } catch (e) {
            document.execCommand("stop");
        }
        //addAreasAndOverlay();
        $("#current_Time").animate({
            "left": (ind * 32 + 5)
        }, 200);
    });
}

function switchButton() {
    $(".bottom_Time>.switch_Button>span").click(function () {
        $(this).addClass("current").siblings("span").removeClass("current");
    });
}