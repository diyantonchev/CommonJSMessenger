angular.module('chat').directive('chatRoom', function () {

    return {
        restrict: 'E',
        scope: {
            toggled: '=',
            allUsers: '<',
            roomInstance: '=',
            msgSendFunction: '=',
            addUserToRoom: '=',
            leaveRoom: "=",
            fileUpload: '=',
            fileDownload: '=',
        },
        templateUrl: 'chatApp/components/chatRoom/chatRoom.html',
        controller: 'ChatRoomCtrl',
        controllerAs: 'vm'
    }
});



