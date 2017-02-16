angular.module('chat').directive('chatWindow', function () {

    return {
        restrict: 'E',
        scope: {
           chatId:'<',
           userId:'<',
        },
        templateUrl: 'chatApp/components/chatWindow/chatWindow.html',
        controller: 'ChatWindowCtrl',
        controllerAs: 'vm'
    }
});



