angular.module('chat').directive('chatPanel', function () {

    return {
        restrict: 'E',
        scope: {
            user: '<',
            accessToken: '<',
        },
        templateUrl: 'chatApp/components/chatPanel/chatPanel.html',
        controller: 'ChatPanelCtrl',
        controllerAs: 'vm'
    }
});



