/**
 * Created by issuser on 2015/8/12.
 */

define(['app', 'angular', 'jquery', 'user'], function (app, angular, $) {
    app.factory('dataFactory', function ($http, $q, $location, user) {
        var url = "/js/data/data.json";

        function requestReLogin(status) {
            if (status == "401") {
                alert("会话已过期，请重新登录！");
                user.logout();

                window.location.href = "/pages/index.html";
            }
        }

        return {
            getData: function (dataSource) {
                var deferred = $q.defer();
                $http({method: 'GET', url: url}).success(function (data) {
                    deferred.resolve(data);
                }).error(function () {
                    deferred.reject('数据读取错误！');
                });
                return deferred.promise;
            },
            getStartDateTime: function (dataArray) {
                return dataArray.sort(function (a, b) {
                    return new Date(a['时间'].replace(/-/g, "/")).getTime() - new Date(b['时间'].replace(/-/g, "/")).getTime();
                })[0]['时间'];
            },
            filterByTime: function (d, time) {
                var result = {};
                for(var k in d){
                    var array = d[k];
                    result[k] = array.filter(function (item, index) {
                        var itemDate = new Date(item['时间'].replace(/-/g, "/")).getTime();
                        var d1 = new Date(time.replace(/-/g, "/")).getTime();
                        return itemDate == d1;
                    })
                }

                return result;
                //return d.filter(function (item, index) {
                //    var itemDate = new Date(item.inspect_time.replace(/-/g, "/")).getTime();
                //    var d1 = new Date(time.replace(/-/g, "/")).getTime();
                //    return itemDate == d1;
                //});
            },
            //getAllData : function (templateId) {
            //    var url = "/api/data/createUserTemplate";
            //    var deferred = $q.defer();
            //    $http({ method: 'POST',url: url, data:{system_templateId:templateId} }).success(function(data){
            //        deferred.resolve(data);
            //    }).error(function(){
            //        deferred.reject('数据读取错误！');
            //    });
            //    return deferred.promise;
            //},
            saveTamplate: function (tid, name, config) {
                var data = {
                    name: name,//用户模板名称
                    template_config: angular.toJson(config),//模板的配置信息 去除 $$hasKey..
                    user_templateId: tid//用户模板ID
                }
                var url = "/api/data/saveUserTemplate";
                var deferred = $q.defer();
                $http({method: 'POST', url: url, data: data}).success(function (data) {
                    deferred.resolve(data);
                }).error(function (data, status) {
                    requestReLogin(status);
                    deferred.reject('数据读取错误！');
                });
                return deferred.promise;
            },
            getHomePageData: function () {
                var homeDataUrl = "/api/data/getHomePage";

                var deferred = $q.defer();
                $http({method: 'POST', url: homeDataUrl}).success(function (data) {
                    deferred.resolve(data);
                }).error(function (data, status) {
                    requestReLogin(status);
                    deferred.reject("读取首页数据出错！");
                });
                return deferred.promise;
            },
            createUserTemplate: function (sysId) {
                var url = "/api/data/createUserTemplate";
                var deferred = $q.defer();
                $http({method: 'POST', url: url, data: {system_templateId: sysId}}).success(function (data) {
                    deferred.resolve(data.data);
                }).error(function (data, status) {
                    requestReLogin(status);
                    deferred.reject('数据读取错误！');
                });
                return deferred.promise;
            },
            getUserTemplateData: function (userTemplateId) {
                var path = '/api/data/getUserTemplate';
                var deferred = $q.defer();
                $http({method: 'POST', url: path, data: {user_templateId: userTemplateId}}).success(function (data) {
                    deferred.resolve(data);
                }).error(function (data, status) {
                    requestReLogin(status);
                    deferred.reject('数据读取错误！');
                });
                return deferred.promise;
            }, publishUserTemplate: function (tid) {
                var path = '/api/data/publishUserTemplate';
                var deferred = $q.defer();
                $http({method: 'POST', url: path, data: {user_templateId: tid}}).success(function (data) {
                    deferred.resolve(data);
                }).error(function (data, status) {
                    requestReLogin(status);
                    deferred.reject('数据读取错误！');
                });
                return deferred.promise;
            }, uploadDataSource: function (dsName, userTemplateId, callback) {
                var url = '/api/data/upload?user_templateId=' + userTemplateId + '&dataSourceName=' + dsName;
                $.ajaxFileUpload
                (
                    {
                        url: url,
                        secureuri: false,
                        type: 'POST',
                        fileElementId: 'excel',
                        success: function (data, status)  //服务器成功响应处理函数
                        {
                            if (typeof (data.error) != 'undefined') {
                                if (data.error != '') {
                                    alert(data.error);
                                } else {
                                    alert(data.msg);
                                }
                            }
                            var responseJson = JSON.parse(data.body.innerText);
                            callback(responseJson.data);
                        },
                        error: function (data, status, e)//服务器响应失败处理函数
                        {
                            requestReLogin(status);
                            alert(e);
                        }
                    });
                return false;
            }, changeDataSource: function (dataSourceId) {
                var path = '/api/data/changeDataSource';
                var deferred = $q.defer();
                $http({method: 'POST', url: path, data: {dataSourceId: dataSourceId}}).success(function (data) {
                    var dataSource = JSON.parse(data.data.dataSource);
                    deferred.resolve(dataSource);
                }).error(function (data, status) {
                    requestReLogin(status);
                    deferred.reject('数据读取错误！');
                });
                return deferred.promise;
            }
        }
    });
});


