angular.module('chat').controller('ChatPanelCtrl', ChatPanelCtrl);

ChatPanelCtrl.$inject = ['$scope', '$timeout', '$q', '$compile', 'dataService', 'socketComunicationService', 'notifierService'];

function ChatPanelCtrl($scope, $timeout, $q, $compile, dataService, socketComunicationService, notifierService) {

    let vm = this;

    // Variables
    vm.accessToken = localStorage.getItem('accessToken');
    vm.currentUserInfo = {
        fullName: '',
        chatHistory: [],
        favourites: []
    };

    // Strings
    vm.autocompletePlaceholder = "Search all users";

    //Functions
    vm.getFullNamesByString = getFullNamesByString;
    vm.onAutocompleteSelect = onAutocompleteSelect;
    vm.createNewChatWindow = createNewChatWindow;
    vm.openChatWindow = openChatWindow;
    vm.panelsToggle = panelsToggle;

    onInit();

    function onInit() {
        // Collecting currentUser info (AJAX)
        dataService.getCurrentUserInfo().then(function (data) {
            vm.currentUserInfo.fullName = data.fullName;
        });

        // Collecting currentUser chat History
        dataService.getChatHistoryBrief().then(function (data) {
            vm.currentUserInfo.chatHistory = data;
        });
    }

    function getFullNamesByString() {
        let deferred = $q.defer();
        if (vm.usersByNameAutocompletePromise) $timeout.cancel(vm.usersByNameAutocompletePromise);
        vm.usersByNameAutocompletePromise = $timeout(function () {
            dataService.getFullNamesByString(vm.searchText).then(function (data) {
                console.log('controller-->', data);
                deferred.resolve(data);
            });
        }, 500);
        return deferred.promise;
    }

    function onAutocompleteSelect(userId) {



        dataService.getChatIdForUsers([vm.accessToken,userId]).then(function (chatId) {
            if (chatId) {
                vm.openChatWindow(chatId);
            } else {
                vm.createNewChatWindow();
            }
        })

    }

    function createNewChatWindow() {
        let el = $compile(`<chat-window></chat-window>`)($scope);
        angular.element(document.querySelector('div.chat-container')).append(el);
    }

    function openChatWindow(chatid) {
        let matches = document.querySelector(`chat-window[chatid="'${chatid}'"] input[type=text]`)
        if (!matches) {
            let el = $compile(`<chat-window chatid="\'${chatid}\'"></chat-window>`)($scope);
            angular.element(document.querySelector('div.chat-container')).append(el);
        } else {
            angular.element(matches).focus();
        }
    }


    function panelsToggle() {
        vm.chatToggle = !vm.chatToggle;
    }
};