angular.module('chat').controller('ChatSingleCtrl', ChatSingleCtrl);

ChatSingleCtrl.$inject = ['$scope'];

function ChatSingleCtrl($scope) {

    let vm = this;

    vm.msgSendFunction = function (room, msg) {
        $scope.msgSendFunction(room, msg);
        vm.msgToSend = '';
    }
    vm.closeChatInstance = function () {
        $scope.toggled = false
        $scope.chatInstance = {};
    }
    //Init Variables


    //Init Functions


    //Sockets

    //Function Declarations


};