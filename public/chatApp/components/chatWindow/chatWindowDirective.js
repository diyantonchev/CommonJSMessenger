angular.module('chat').directive('chatWindow', function () {

    return {
        restrict: 'E',
        scope: {
           chatid:'<',
           userid:'<'
        },
        templateUrl: 'chatApp/components/chatWindow/chatWindow.html',
        controller: 'ChatWindowCtrl',
        controllerAs: 'vm'
    }
});



