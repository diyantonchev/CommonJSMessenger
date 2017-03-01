angular.module('chat')
    .factory('dataService', dataService);

dataService.$inject = ['$http'];
function dataService($http) {

    let service = {

        getCurrentUserInfo:getCurrentUserInfo,
        getFullNamesByString:getFullNamesByString
    };

    return service;

    function getCurrentUserInfo() {
        return $http({
            method: "GET",
            url: '/currentUserInfo',
            headers: { 'Content-Type': 'application/json' },
            params: {accessToken : localStorage.getItem('accessToken')}
        }).then((response) => {
            return response.data;
        }).catch(err => console.err);
    }

    function getFullNamesByString(userId, searchString){
        return $http({
            method: "GET",
            url: '/fullNamesByString',
            headers: { 'Content-Type': 'application/json' },
            params: {userId, searchString }
        }).then((response) => {
            return response.data;
        }).catch(err => console.err);
    }
}