var app = angular.module("tpl", []);
app.controller("tplController", function($scope, dataFactory){
    /* define the application title */
    $scope.appTitle = "环保大数据可视化 - 石家庄";
    $scope.toggleEditMode = function(){
        var obj = $(event.target).closest("div.top_Content");
        obj.find(".title").toggle();
        obj.find('input').toggleClass("editing").focus();
    }
    $scope.editOnEnter = function(){
        if(event.keyCode == 13){
            $scope.toggleEditMode();
        }
    }
    $scope.dataSource = {};
    dataFactory.getData().then(function (data) {
        $scope.dataSource = data;
        $scope.coordinates = "39°28'00.00 N170°35'00.00 E";
        $scope.$broadcast('dataReady', dataFactory.filterByTime($scope.dataSource, '2015-07-14  00:00:00'));
    }, function (err) {
        console.info(err);
    });
    $scope.$on('filterByTime', function(d, time){
        if (!$scope.dataSource) return;
        $scope.$broadcast('dataReady', dataFactory.filterByTime($scope.dataSource, time));
    });
});

app.factory('dataFactory', function($http, $q){
    var url = "./data.json";
    return {
        getData: function(){
            var deferred = $q.defer();
            $http({ method: 'GET',url: url }).success(function(data){
                deferred.resolve(data);
            }).error(function(){
                deferred.reject('数据读取错误！');
            });
            return deferred.promise;
        },
        filterByTime: function(d, time){
            return d.filter(function (item, index) {
                var itemDate = new Date(item.inspect_time.replace(/-/g, "/")).getTime();
                var d1 = new Date(time.replace(/-/g, "/")).getTime();
                return itemDate == d1;
            });
        }
    }
});