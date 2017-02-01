angular.module('chat').controller('ChatRoomCtrl', ChatRoomCtrl);

ChatRoomCtrl.$inject = ['$scope'];

function ChatRoomCtrl($scope) {

    let vm = this;

    //Init Variables
    vm.userSearch = userSearch;
    vm.msgSendFunction = function (room, msg) {
        $scope.msgSendFunction(room, msg);
        vm.msgToSend = '';
    }
    vm.closeRoomInstance = function () {
        $scope.roomInstance = {};
        $scope.toggled = false
    }
    //Init Functions


    //Sockets




    //Function Declarations
    function userSearch(query) {
        let ids = $scope.roomInstance.users.map((user) => { return user.id});
        return $scope.allUsers.filter((user) => {
            return user.fullName.includes(query) && (ids.indexOf(user._id) === -1) ;
        });
    }



};