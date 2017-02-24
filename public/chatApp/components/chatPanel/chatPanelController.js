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
    vm.openChatWindow = openChatWindow;
    vm.panelsToggle = panelsToggle;
    vm.updateChatHistory = updateChatHistory;
    vm.saveUserSettings = saveUserSettings;

    onInit();

    function onInit() {
        // Collecting currentUser info (AJAX)
        dataService.getCurrentUserInfo().then(function (data) {
            vm.currentUserInfo.fullName = data.fullName;
            console.log("FULL NAME", vm.currentUserInfo.fullName);
            updateChatHistory();
        });

        // Collecting currentUser chat History
        //  vm.updateChatHistory();
    }

    function updateChatHistory() {
        chatService.getChatHistoryBrief().then(function (data) {
            vm.currentUserInfo.chatHistory = data;
            console.log("CHAT HISTORY", vm.currentUserInfo.chatHistory);
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
                vm.openChatWindow(chatId);
                updateChatHistory()
            });
        }
    }


    function openChatWindow(chatid) {
        let matches = document.querySelector(`chat-window[chatid="'${chatid}'"] input[type=text].messageInput`);
        if(matches){
            angular.element(matches).focus();
        }
        else{
            let el = $compile(`<chat-window chatid="'${chatid}'" userownname="'${vm.currentUserInfo.fullName}'"></chat-window>`)($scope);
            angular.element(document.querySelector('div.chat-container')).append(el)
            $timeout(function(){
                matches = document.querySelector(`chat-window[chatid="'${chatid}'"] input[type=text].messageInput`);
                angular.element(matches).focus();
            },100);
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