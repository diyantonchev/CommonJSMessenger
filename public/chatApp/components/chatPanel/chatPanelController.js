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
    vm.socket.emit('user connected', {accessToken: vm.accessToken})


    vm.userSettings = readUserSettings();

    function readUserSettings() {
        vm.userSettings = JSON.parse(localStorage.getItem('userSettings'));
        console.log('readUserSettings', vm.userSettings);
        if (!vm.userSettings) {
            vm.userSettings = {
                enableNotifications: true
            };
            saveUserSettings();
        }
        console.log('return readUserSettings', vm.userSettings);
        return vm.userSettings;
    }

    function saveUserSettings() {
        $timeout(function(){
            localStorage.setItem('userSettings', JSON.stringify(vm.userSettings));
        },100)
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
    vm.saveUserSettings = saveUserSettings;

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
        if (vm.userSettings.enableNotification) {
            notifierService.notifyMe(resp.userId + ' send you a new message!');
        }
        vm.updateChatHistory();
        window.focus();
    });


    function panelsToggle() {
        vm.chatToggle = !vm.chatToggle;
    }
}
;