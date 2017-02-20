angular.module('chat').controller('ChatWindowCtrl', ChatWindowCtrl);

ChatWindowCtrl.$inject = ['$scope', '$timeout', 'chatService'];

function ChatWindowCtrl($scope, $timeout, chatService) {

    let vm = this;

    vm.socket = io.connect();

    vm.chatid = $scope.chatid;
    vm.userid = $scope.userid;
    vm.chatHeader = '';


    console.log($scope);


    vm.getChatIdForUsers = getChatIdForUsers;
    vm.destroyChatWindow = destroyChatWindow;
    vm.scrollChatToBottom = scrollChatToBottom;
    vm.focusInput = focusInput;


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
                    vm.messages = messages;
                    vm.scrollChatToBottom();
                    vm.focusInput();
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


    function destroyChatWindow() {
        $scope.$destroy();
        angular.element(document.querySelector(`chat-window[chatid="'${vm.chatid}'"]`)).remove();
    }

    function scrollChatToBottom() {
        $timeout(function(){ // dirty
            let elem = document.querySelector(`chat-window[chatid="'${vm.chatid}'"] ul`);
            elem.scrollTop = elem.scrollHeight;


        },1);
    }
    function focusInput() {
        angular.element(document.querySelector(`chat-window[chatid="'${vm.chatid}'"] input[type=text]`)).focus();

    }

    // callback
    vm.socket.on('messageReceivedByServer', (response) => {
        if (response.message) {
            vm.userMessage = ''; // on success clearing the message mox and wait for another message input
            vm.messages.push(response);
            $scope.$apply();
            vm.scrollChatToBottom();
        }
    });


};