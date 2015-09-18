/**
 * 入口文件
 * 2014-11-30 mon
 */
require.config({
    baseUrl: "js/",
    paths: {
        "jquery": "libs/jquery203",
        "angular" : "libs/angular",
        "angular-route" : "libs/angular-route.min",
        "angular-animate" : "libs/angular-animate.min",
        "nicescroll": "libs/jquery.nicescroll.min",
        "app" : "app",
        "route" : "routes",
        "home": "controllers/home",
        "login": "controllers/login",
        "register": "controllers/register",
        "unauthorized": "controllers/unauthorized",
        "editor": "controllers/editor",
        "authInterceptor": "services/authInterceptor",
        "user": "services/user",
        "compareTo": "directives/compareTo",
        "tableChart": "directives/tableChart",
        "leftPanel":"directives/leftPanel",
        "rightPanel":"directives/rightPanel",
        "hasPermission": "directives/hasPermission",
        "zone":"directives/zone",
        "blocksChart":"directives/blocksChart",
        "roseChart":"directives/roseChart",
        "barChart":"directives/barChart",
        "timeline":"directives/timeline",
        "waterProgressChart":"directives/waterProgressChart",
        "resultStatus": "utils/resultStatus",
        "bootstrap": "libs/bootstrap.min",
        "echarts":"libs/Echarts/echarts-all",
        "dataFactory":"services/dataFactory",
        "components":"directives/components",
        "layout":"directives/layout",
        "layoutTitle":"directives/layoutTitle",
        "preview": "controllers/preview",
        "esri":"http://js.arcgis.com/3.14/esri",
        "dojo":"http://js.arcgis.com/3.14/dojo",
        "dojox":"http://js.arcgis.com/3.14/dojox",
        "dijit":"http://js.arcgis.com/3.14/dijit",
        "ajaxfileupload":"libs/ajaxfileupload",
        "ng-sortable": "libs/ng-sortable",
        "legendChart":"directives/legendChart",
        "angular-highlightjs":"libs/angular-highlightjs",
        "draganddrop":"libs/draganddrop",
        "hljs":"libs/highlight.pack",
        "bootbox":"libs/bootbox.min"
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        'angular-route': {
            deps: ["angular"],
            exports: 'angular-route'
        },
        'angular-animate': {
            deps: ["angular"],
            exports: 'angular-animate'
        },
        'ng-sortable': {
            deps: ["angular"],
            exports: 'ng-sortable'
        },
        'bootstrap': {
            deps: ["jquery"],
            exports: 'bootstrap'
        },
        'ajaxfileupload':{
            deps: ["jquery"],
            exports: 'ajaxfileupload'
        },
        "draganddrop":{
            deps: ["angular"],
            exports: 'draganddrop'
        }
    }
});



require(['jquery', 'angular','echarts','components','dataFactory','layout', 'compareTo','angular-route', 'angular-animate','ajaxfileupload', 'bootstrap', 'app', 'route', 'home', 'login', 'register', 'unauthorized','editor','preview', 'authInterceptor','rightPanel','leftPanel', "zone", "blocksChart","timeline", "roseChart","barChart","tableChart","legendChart","layoutTitle", "waterProgressChart", 'nicescroll','ng-sortable'], function ($, angular) { //,'esri/map','dojo/domReady!'
    $(document).ready(function () {
        angular.bootstrap(document, ["dataVisualization"]);
    })
});