angular.module('chat').controller('ChatPanelCtrl', ChatPanelCtrl);

ChatPanelCtrl.$inject = ['$scope', '$timeout', '$q', '$compile', 'dataService', 'chatService', 'socketComunicationService', 'notifierService'];

function ChatPanelCtrl($scope, $timeout, $q, $compile, dataService, chatService, socketComunicationService, notifierService) {

    let vm = this;

    vm.chatToggle = true;


    // Variables
    vm.accessToken = localStorage.getItem('accessToken');
    vm.currentUserInfo = {
        fullName: '',
        chatHistory: [],
        favourites: []
    };
    vm.socket = io.connect();
    vm.socket.emit('user connected', { accessToken: vm.accessToken })


    vm.userSettings = readUserSettings();

    function readUserSettings() {
        let settings = localStorage.getItem('userSettings');
        if (!settings) {
            settings = {
                enableNotifications: true
            };
            localStorage.setItem('settings', settings);
        }
        return settings;
    }

    function updateUserSetting(setting, value) {

    }


    // Strings
    vm.autocompletePlaceholder = "Search all users";

    //Functions
    vm.getFullNamesByString = getFullNamesByString;
    vm.onAutocompleteSelect = onAutocompleteSelect;
    vm.createNewChatWindow = createNewChatWindow;
    vm.openChatWindow = openChatWindow;
    vm.panelsToggle = panelsToggle;
    vm.updateChatHistory = updateChatHistory;

    onInit();

    function onInit() {
        // Collecting currentUser info (AJAX)
        dataService.getCurrentUserInfo().then(function (data) {
            vm.currentUserInfo.fullName = data.fullName;
        });

        // Collecting currentUser chat History
        vm.updateChatHistory();
    }

    function updateChatHistory() {
        chatService.getChatHistoryBrief().then(function (data) {
            vm.currentUserInfo.chatHistory = data;
        });
    }

    function getFullNamesByString() {
        let deferred = $q.defer();
        if (vm.usersByNameAutocompletePromise) $timeout.cancel(vm.usersByNameAutocompletePromise);
        vm.usersByNameAutocompletePromise = $timeout(function () {
            dataService.getFullNamesByString(vm.accessToken, vm.searchText).then(function (data) {
                deferred.resolve(data);
            });
        }, 500);
        return deferred.promise;
    }

    function onAutocompleteSelect(userId) {
        if (userId) {
            chatService.getChatIdForUsers([vm.accessToken, userId]).then(function (chatId) {
                // check if there was previous chat with this user
                if (chatId) {
                    vm.openChatWindow(chatId);
                } else {
                    vm.createNewChatWindow([vm.accessToken, userId]);
                }
            });
        }
    }

    function createNewChatWindow(participants) {
        let el = $compile(`<chat-window participants="'${participants}'"></chat-window>`)($scope);
        angular.element(document.querySelector('div.chat-container')).append(el);
    }

    function openChatWindow(chatid) {
        let matches = document.querySelector(`chat-window[chatid="'${chatid}'"] input[type=text]`);
        if (!matches) {
            let el = $compile(`<chat-window chatid="'${chatid}'"></chat-window>`)($scope);
            angular.element(document.querySelector('div.chat-container')).append(el);
        } else {
            angular.element(matches).focus();
        }
    }

    vm.socket.on('new message notification', function (resp) {
        notifierService.notifyMe(resp.userId + ' send you a new message!');
        vm.updateChatHistory();
    });


    function panelsToggle() {
        vm.chatToggle = !vm.chatToggle;
    }
};