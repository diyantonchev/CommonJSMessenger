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
                        element[0].scrollTop =  element[0].scrollHeight;
                    }, 0);
                }
            });
            // element.bind("scroll", function () {
            //     if(element[0].scrollTop ===  0){
            //         scope.socket.emit('scroll', scope.room);
            //     }
            // });
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
            element.bind("change", function (changeEvent) {
                let reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread(loadEvent.target.result, element[0].value);
                        element[0].value = "";
                    });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);