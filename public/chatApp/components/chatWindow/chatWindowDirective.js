angular.module('chat').directive('chatWindow', function () {

    return {
        restrict: 'E',
        scope: {
            toggled: '=',
            chatInstance: '=',
            msgSendFunction: '=',
            fileUpload: '=',
            fileDownload: '=',
        },
        templateUrl: 'chatApp/components/chatWindow/chatWindow.html',
        controller: 'ChatWindowCtrl',
        controllerAs: 'vm'
    }
});



