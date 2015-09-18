/**
 * 路由
 */
define(['app'], function (app) {
    return app.config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/home', {
                templateUrl: '/js/views/home.html',
                controller: 'home',
                permission : 'Login'
            }).when('/editor/:tid/:design', {
                templateUrl: '/js/views/editor.html',
                controller: 'editor',
                permission : 'Login'
            }).when('/editor', {
                templateUrl: '/js/views/editor.html',
                controller: 'editor',
                permission : 'Login'
            }).when('/preview/:tid', {
                templateUrl: '/js/views/preview.html',
                controller: 'preview',
            }).when('/login', {
                templateUrl: '/js/views/login.html',
                controller: 'login'
            }).when('/register', {
                templateUrl: '/js/views/register.html',
                controller: 'register'
            }).when('/unauthorized', {
                templateUrl: '/js/views/unauthorized.html',
                controller: 'unauthorized'
            }).otherwise({
                redirectTo: '/login'
            });
        }]);
   
  


})