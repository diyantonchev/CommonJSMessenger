angular.module('chat').controller('ChatWindowCtrl', ChatWindowCtrl);

ChatWindowCtrl.$inject = ['$scope'];

function ChatWindowCtrl($scope) {

    let vm = this;

    vm.chatId = $scope.chatId;
    vm.userId = $scope.userId;

    vm.sendMessage = function(event){
        if(event.keyCode == 13){
            console.log('sending message: ' + vm.userMessage);
            vm.userMessage = '';
        }
    }

    vm.ownId = localStorage.getItem('accessToken');
    vm.chatTitle = 'Chat name';

    // TODO : hardcoded values
    vm.messages = [
        {
            authorId:"589dbe874a1dad6d2e933fc3",
            authorName:"qwerty",
            avatar:false,
            date:"2017-01-03 22:00:00.000Z",
            body: "lor sit amet, consectetur adipiscing elit. Praesent auctor porttitor est, elementum porta ipsum dictum a. Aenean sit amet finibus elit."
        },
        {
            authorId:"589dbe874a1dad6d2e933fce",
            authorName:"qwerty",
            avatar:false,
            date:"2017-02-13 22:00:00.000Z",
            body: "tor est, elementum porta ipsum dictum a. Aenean sit amet finibus elit."
        },
        {
            authorId:"589dbe874a1dad6d2e933fc3",
            authorName:"qwerty",
            avatar:false,
            date:"2017-02-13 21:00:00.000Z",
            body: "tor est, elementum porta ipsum dictum a. Aenean sit amet finibus elit."
        },
        {
            authorId:"589dbe874a1dad6d2e933fce",
            authorName:"qwerty",
            avatar:false,
            date:"2017-02-13 22:00:00.000Z",
            body: "tor est, elementum porta ipsum dictum a. Aenean sit amet finibus elit."
        },
        {
            authorId:"589dbe874a1dad6d2e933fc3",
            authorName:"qwerty",
            avatar:false,
            date:"2017-02-13 21:00:00.000Z",
            body: "tor est, elementum porta ipsum dictum a. Aenean sit amet finibus elit."
        },
        {
            authorId:"589dbe874a1dad6d2e933fce",
            authorName:"qwerty",
            avatar:false,
            date:"2017-02-13 22:00:00.000Z",
            body: "tor est, elementum porta ipsum dictum a. Aenean sit amet finibus elit."
        },
        {
            authorId:"589dbe874a1dad6d2e933fc3",
            authorName:"qwerty",
            avatar:false,
            date:"2017-02-13 21:00:00.000Z",
            body: "tor est, elementum porta ipsum dictum a. Aenean sit amet finibus elit."
        }
    ];




};