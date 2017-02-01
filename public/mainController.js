angular.module('chat').controller('MainCtrl', MainCtrl);

MainCtrl.$inject = ['dataservice'];

function MainCtrl(dataservice) {

    let vm = this;

    vm.login = function (username, password) {
        dataservice.login({username:username, password:password}).then((user) => {
            vm.loggedUser = user;
        });
    };
};