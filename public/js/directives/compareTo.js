define(['app'], function (app) {
    return app.directive('compareTo', function () {
        return {
            require: "ngModel",
            scope: {
                otherModelValue: "=compareTo"
            },
            link: function (scope, element, attributes, ngModel) {
                
                ngModel.$validators.compareTo = function (modelValue) {
                    return modelValue == scope.otherModelValue.$modelValue;
                };
                scope.$watch("otherModelValue", function () {
                    ngModel.$validate();
                });

            }
        };
    });
});