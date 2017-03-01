angular.module('chat').controller('ChatWindowCtrl', ChatWindowCtrl);

ChatWindowCtrl.$inject = ['$scope', '$timeout', '$element', 'chatService'];

function ChatWindowCtrl($scope, $timeout, $element, chatService) {

    let vm = this;

    vm.chatid = $scope.chatid;
    vm.participants = [];
    vm.messages = [];
    vm.chatHeader = '';
    vm.ownId = localStorage.getItem('accessToken');
    vm.isDisplayingSearchResult = false;
    vm.enableSearch = false;
    vm.searchedMessage = '';

    vm.destroyChatWindow = destroyChatWindow;
    vm.scrollChatToBottom = scrollChatToBottom;
    vm.focusInput = focusInput;
    vm.getMessagesBySearchstring = getMessagesBySearchstring;
    vm.sendMessage = sendMessage;

    onInit();

    function onInit() {
        // Oppening the chat window :
        // if we don't have chat id we need to retreive it based
        // on the userId we are trying to chat to
        if (vm.chatid) {
            getChatHistory();
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

    function getChatHistory() {
        chatService.getChatHistory(vm.chatid)
            .then((messages) => {
                vm.chatHeader = messages.participants[0] !== $scope.userownname ? messages.participants[0] : messages.participants[1];
                vm.messages = messages.messages;
                vm.participants = messages.participants;
                vm.scrollChatToBottom();
                vm.focusInput();
            });
    }

    function getMessagesBySearchstring() {
        if (vm.searchedMessage.length >= 3) {
            vm.isDisplayingSearchResult = true;
            if (vm.searchedMessagePromise) $timeout.cancel(vm.searchedMessagePromise);
            vm.searchedMessagePromise = $timeout(function () {
                chatService.getMessagesBySearchstring(vm.chatid, vm.searchedMessage).then((messages) => {
                    vm.messages = messages;
                })
            }, 500);
        } else if (vm.isDisplayingSearchResult) {
            vm.isDisplayingSearchResult = false;
            getChatHistory();
        }
    }

    function sendMessage(event) {
        if (event.keyCode == 13 && vm.userMessage) {
            $scope.$parent.vm.socket.emit('message', {message: vm.userMessage, chatid: vm.chatid, userid: vm.ownId});
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

    $scope.$parent.vm.socket.on('new message', (response) => {
        if (response.message && response.chatId == vm.chatid) {
            vm.userMessage = '';
            vm.messages.push(response);
            $scope.$apply();
            vm.scrollChatToBottom();
        }
    });

};