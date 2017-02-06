angular.module('chat').directive('chatSingle', function () {

    return {
        restrict: 'E',
        scope: {
            toggled: '=',
            chatInstance: '=',
            msgSendFunction: '=',
            fileUpload: '=',
            fileDownload: '=',
        },
        templateUrl: 'chatApp/components/chatSingle/chatSingle.html',
        controller: 'ChatSingleCtrl',
        controllerAs: 'vm'
    }
});



