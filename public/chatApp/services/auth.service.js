angular.module('chat')
    .factory('authService', authService);

authService.$inject = ['$http'];

function authService($http) {
    let service = {
        login: login
    };
    return service;

    function login(userData) {
        return $http({
            url: '/login',
            headers: { 'Content-Type': 'application/json' },
            method: "POST",
            data: userData
        }).then((response) => {
            return {'accessToken':response.data.accessToken};
        }).catch(err => console.err);
    }


}