/**
 * 建立angular.module
 */
define(['angular'], function (angular) {
    var app = angular.module('dataVisualization', ['ngRoute', 'ngAnimate','ng-sortable','ang-drag-drop']);//, 'ajaxLoading'
    
    app.run(['$rootScope', '$location', 'user', function ($rootScope, $location, user) {
            $rootScope.user = null;
            //user.setUser($rootScope.user);
            //var exclude = ['/',''];
            $rootScope.$on('$routeChangeStart', function (event, next, current) {
                var permission = next.$$route ? next.$$route.permission : "";
                if (permission){
                    if (angular.isString(permission) && !user.hasPermission(permission)) {
                        // here I redirect page to '/unauthorized',you can edit it
                        $location.path('/unauthorized');
                    }
                }
                //if (user.getUser() && !permission) {
                //    $location.path('/home');
                //}

                if(user.getUser() && next.$$route.controller == "login"){
                    $location.path('/home');
                }


            });
        }]);
    
    
    return app;
});
