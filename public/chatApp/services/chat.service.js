angular.module('chat')
    .factory('chatService', authService);

chatService.$inject = ['$http'];

function chatService($http) {
    let service = {
        openSession: openSession, // open chat window with given chatID
        openChat: openChat, // open chat window with given user ID (search in DB for existing chat session with selected user ONLY)
    };
    return service;

    function openSession(chatId){
        console.log('openSession',chatId);
    }
    function openChat(userId){
        console.log('openChat',userId);
    }



}