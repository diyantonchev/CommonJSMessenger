angular.module('chat').directive('scrollEvents', function($timeout) {
    return {
        scope: {
            chatInstance: "=",
        },
        restrict: 'A',
        link: function(scope, element) {

            scope.$watchCollection('chatInstance', function(newVal) {
                if (newVal) {
                    $timeout(function() {
                        element[0].scrollTop = element[0].scrollHeight;
                    }, 0);
                }
            });
        }
    };
});

angular.module('chat').directive('focusEnter', function () {
    return {
        restrict: 'A',
        scope: {
            sendFunc: '&',
            inputModel: '='
        },
        link: function (scope, element) {
            element.bind("keydown", function (event) {
                if (event.keyCode === 13 && scope.inputModel != '' && scope.inputModel != null && !event.shiftKey) {
                    scope.sendFunc();
                    scope.inputModel = '';
                    element.focus();
                }
            });
        }
    }
});

angular.module('chat').directive("fileread", [function () {
    return {
        scope: {
            fileread: '='
        },
        link: function (scope, element) {
            element.bind("change", function (e) {
                let file = e.target.files[0];
                scope.fileread(file);
                element[0].value = "";
            });
        }
    }
}]);