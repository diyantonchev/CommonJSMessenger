angular.module('chat').controller('ChatWindowCtrl', ChatWindowCtrl);

ChatWindowCtrl.$inject = ['$scope', '$timeout', '$element', 'chatService'];

function ChatWindowCtrl($scope, $timeout, $element, chatService) {

    let vm = this;

    vm.chatid = $scope.chatid;

    vm.participants = [];
    vm.chatHeader = '';


    vm.destroyChatWindow = destroyChatWindow;
    vm.scrollChatToBottom = scrollChatToBottom;
    vm.focusInput = focusInput;


    vm.sendMessage = sendMessage;

    vm.ownId = localStorage.getItem('accessToken');
    vm.chatTitle = 'Chat name';

    onInit();

    function onInit() {

        // Oppening the chat window :
        // if we don't have chat id we need to retreive it based
        // on the userId we are trying to chat to
        if (vm.chatid) {
            chatService.getChatHistory(vm.chatid)
                .then((messages) => {
                console.log(messages);
                    vm.chatHeader = vm.chatid;
                    vm.messages = messages;
                    vm.participants = messages;
                    vm.scrollChatToBottom();
                    vm.focusInput();
                });
        } else {
            if ($scope.participants) {
                vm.participants = $scope.participants.split(',');
                chatService.createChat(vm.participants)
                    .then((response) => {
                        vm.chatHeader = vm.chatid;
                        vm.chatid = response.chatid;
                        $element.attr('chatid', vm.chatid);
                        vm.focusInput();
                    });
            }
        }
    }


    function sendMessage(event) {
        if (event.keyCode == 13 && vm.userMessage) {
            $scope.$parent.vm.socket.emit('message', {message: vm.userMessage, chatid: vm.chatid, userid: localStorage.getItem('accessToken')});
        }
    }

    function destroyChatWindow() {
        $scope.$destroy();
        $element.remove();
    }

    function scrollChatToBottom() {
        $timeout(function () { // dirty
            let elem = $element.find('ul')[0];
            elem.scrollTop = elem.scrollHeight;
        }, 1);
    }

    function focusInput() {
        $element.focus();
    }

    // callback
    $scope.$parent.vm.socket.on('new message', (response) => {
        if (response.message && response.chatId == vm.chatid) {
            vm.userMessage = '';
            vm.messages.push(response);
            $scope.$apply();
            vm.scrollChatToBottom();
        }
        alert('new message');
    });

};