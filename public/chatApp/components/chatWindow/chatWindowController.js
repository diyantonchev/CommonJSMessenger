angular.module('chat').controller('ChatWindowCtrl', ChatWindowCtrl);

ChatWindowCtrl.$inject = ['$scope', 'chatService'];

function ChatWindowCtrl($scope, chatService) {

    let vm = this;

    vm.socket = io.connect();

    vm.chatid = $scope.chatid;
    vm.userid = $scope.userid;
    vm.chatHeader = '';


    console.log($scope);


    vm.getChatIdForUsers = getChatIdForUsers;
    vm.destroyChatWindow = destroyChatWindow;


    vm.sendMessage = sendMessage;

    vm.ownId = localStorage.getItem('accessToken');
    vm.chatTitle = 'Chat name';

    onInit();

    function onInit() {

        vm.chatHeader = vm.chatid + ' | ' + vm.userid

        // Oppening the chat window :
        // if we don't have chat id we need to retreive it based
        // on the userId we are trying to chat to
        if (vm.chatid) {
            chatService.getChatHistory(vm.chatid)
                .then((messages) => {
                    console.log(messages);
                    vm.messages = messages;
                });
        } else {
            this.getChatIdForUsers(localStorage.getItem('accessToken'), vm.userid).then(function (param) {
                chatService.getChatHistory(param);
            })
        }
    }

    function sendMessage(event) {
        if (event.keyCode == 13 && vm.userMessage) {
            vm.socket.emit('message', {message: vm.userMessage, chatid: vm.chatid, userid: localStorage.getItem('accessToken')});
        }
    }


    function getChatIdForUsers(user1, user2) {

    }

    function destroyChatWindow() {
        console.log(document.querySelector('chat-window[chatid=\''+ vm.chatid +'\']'),'chat-window[chatid=\''+ vm.chatid +'\']');
        $scope.$destroy();
        angular.element(document.querySelector(`chat-window[chatid=\'${vm.chatid}\']`)).empty();
    }


    // callback
    vm.socket.on('messageReceivedByServer', (response) => {
        if (response === true) {
            vm.userMessage = ''; // on success clearing the message mox and wait for another message input
            $scope.$apply()
        }
    });

};