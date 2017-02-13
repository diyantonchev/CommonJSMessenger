angular.module('chat').controller('MainCtrl', MainCtrl);

MainCtrl.$inject = ['authService'];

function MainCtrl(authService) {

    let vm = this;
    vm.loginError = false;

    vm.login = function (username, password) {
        authService.login({username:username, password:password}).then((response) => {
            vm.loginError = false;
            vm.accessToken = response.accessToken;
            localStorage.setItem('accessToken', response.accessToken);
        }).catch(function (err) {
            vm.loginError = true;
        });
    };

    vm.logout = function () {
        localStorage.removeItem('accessToken');
        location.reload();
    };

};