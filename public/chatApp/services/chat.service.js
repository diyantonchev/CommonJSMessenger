angular.module('chat')
    .factory('chatService', chatService);

chatService.$inject = ['$http'];

function chatService($http) {
    let service = {
        openSession: openSession, // open chat window with given chatID
        openChat: openChat, // open chat window with given user ID (search in DB for existing chat session with selected user ONLY)
        getChatHistory: getChatHistory
    };

    return service;

    function openSession(chatId) {
        console.log('openSession', chatId);
    }

    function openChat(userId) {
        console.log('openChat', userId);
    }

    function getChatHistory(chatId, lastMessageId) {
        return $http({
            method: 'GET',
            url: '/chatHistory',
            headers: { 'Content-Type': 'application/json' },
            params: { chatId, lastMessageId }
        }).then((response) => {
            return response.data;
        }).catch(console.err);
    }

}