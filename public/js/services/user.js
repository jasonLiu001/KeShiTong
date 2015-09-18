define(['app'], function (app) {
   return app.factory('user', ['$rootScope', function ($rootScope) {
            var $$user;
            return {
                setUser: function (user) {
                    
                    window.localStorage['user'] = user ? JSON.stringify(user) : "";
                    $rootScope.$broadcast('permissionsChanged')
                },
                getUser: function () {
                    if (!$$user) {
                        var str = window.localStorage['user'];
                        $$user = str ? JSON.parse(str) : null;
                    }
                    return $$user;

			//return $$user = window.localStorage['user'];

                },
                logout: function () {
                    $$user = null;
                    window.localStorage['user'] = "";
                },
                hasPermission: function (permission) {
                    var user = this.getUser();
                    if (user) {
                        //if () {
                        //	return true;
                        //} else {
                        //	return false;
                        //}
                        return user.permissions.indexOf(permission.trim()) > -1;
                    } else {
                        return false;
                    }
				
                }
            };
        }]);

});