angular.module('chat').controller('ChatWindowCtrl', ChatWindowCtrl);

ChatWindowCtrl.$inject = ['$scope', 'chatService'];

function ChatWindowCtrl($scope, chatService) {

//     let vm = this;

//     vm.socket = io.connect();

//     vm.chatid = $scope.chatid;
//     vm.userid = $scope.userid;
// console.log($scope);
    

//     vm.sendMessage = sendMessage;

//     vm.ownId = localStorage.getItem('accessToken');
//     vm.chatTitle = 'Chat name';

//     onInit();

//     function onInit() {
//         // console.log(vm.chatId);
//         chatService.getChatHistory('kur', '58a599029c87b61b600fa279')
//             .then((messages) => {
//                 console.log(messages);
//                 vm.messages = messages;
//             });
//     }

//     function sendMessage(event) {
//         if (event.keyCode == 13 && vm.userMessage) {
//             vm.socket.emit('message', vm.userMessage);
//             vm.userMessage = '';
//             vm.socket.on('messageSent', (msg) =>{
//                 console.log(msg)
//             });
//         }
//     }


};