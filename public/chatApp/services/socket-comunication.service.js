angular.module('chat')
    .factory('socketComunicationService', socketComunicationService);

authService.$inject = ['$http'];

function socketComunicationService($http) {
    let service = {
        openChatWindow:openChatWindow
    };
    return service;


    function openChatWindow(chatId) {
        vm.socket.emit('open-chat', {chatId:chatId});
    };

}