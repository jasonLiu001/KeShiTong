define(['app'], function (app) {
    return app.directive('hasPermission', ['angularUser', function (angularUser) {
            return {
                link: function (scope, element, attrs) {
                    if (!angular.isString(attrs.hasPermission))
                        throw "hasPermission value must be a string, 你懂了吗亲?";
                    var value = attrs.hasPermission.trim();
                    var notPermissionFlag = value[0] === '!';
                    if (notPermissionFlag) {
                        value = value.slice(1).trim();
                    }
                    
                    function toggleVisibilityBasedOnPermission() {
                        var hasPermission = angularUser.hasPermission(value);
                        if (hasPermission && !notPermissionFlag || !hasPermission && notPermissionFlag) {
                            element.show();
                        } else {
                            element.remove();
                        }
                    }
                    toggleVisibilityBasedOnPermission();
                    scope.$on('permissionsChanged', toggleVisibilityBasedOnPermission);
                }
            };
        }]);
});