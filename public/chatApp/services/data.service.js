angular.module('chat')
    .factory('dataService', dataService);

dataService.$inject = ['$http'];
function dataService($http) {

    let service = {

        getCurrentUserInfo:getCurrentUserInfo,
        getFullNamesByString:getFullNamesByString,
        getChatHistoryBrief:getChatHistoryBrief,
        getChatIdForUsers:getChatIdForUsers,


        createNewRoom: createNewRoom,
        getAllUsers: getAllUsers,
        downloadFile: downloadFile,
        getRoomsData: getRoomsData,
        createSingleChat: createSingleChat,
        addGroupChat: addGroupChat,
        addUserToRoom : addUserToRoom,
        removeUserFromRoom: removeUserFromRoom,
        deleteRoom: deleteRoom,
        switchFavourite: switchFavourite
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


    function getFullNamesByString(searchString){
        return $http({
            method: "GET",
            url: '/fullNamesByString',
            headers: { 'Content-Type': 'application/json' },
            params: {searchString : searchString }
        }).then((response) => {
            return response.data;
        }).catch(err => console.err);
    }

    function getChatHistoryBrief(){
        return $http({
            method: "GET",
            url: '/chatHistoryBrief',
            headers: { 'Content-Type': 'application/json' },
            params: {accessToken : localStorage.getItem('accessToken')}
        }).then((response) => {
            return response.data;
        }).catch(err => console.err);
    }

    function getChatIdForUsers(arrayOfUsersIds) {
        return $http({
            method: "GET",
            url: '/chatIdForUsers',
            headers: { 'Content-Type': 'application/json' },
            params: {arrayOfUsersIds}
        }).then((response) => {
            return response.data;
        }).catch(err => console.err);
    }







    //NEW
    function createNewRoom(roomData) {
        return $http({
            url: '/createRoom',
            headers: { 'Content-Type': 'application/json' },
            method: "POST",
            data: roomData
        }).then((response) => {
            return response.data;
        }).catch(err => console.err);
    }

    function getAllUsers(userId) {
        return $http({
            url: '/users',
            method: "GET",
            params: { loggedUser: userId }
        }).then((response) => {
            return response.data;
        }).catch(err => console.err);
    };

    function getRoomsData(userId) {
        return $http({
            url: '/getRooms',
            method: "GET",
            params: { loggedUser: userId }
        }).then((response) => {
            return response.data;
        }).catch(err => console.err);
    }

    function downloadFile(filePath) {
        return $http({
            url: '/download',
            method: "POST",
            data: { filePath: filePath }
        }).then((response) => {
            return response.data;
        }).catch(err => console.err);
    }

    function switchFavourite(data) {
        return $http({
            url: '/favourite',
            method: "POST",
            data: { data: data }
        }).then((response) => {
            return response.data;
        }).catch(err => console.err);
    }

    //OLD






    function createSingleChat(data) {
        return $http({
            url: '/singleChat',
            headers: { 'Content-Type': 'application/json' },
            method: "POST",
            data: data
        }).then((response) => {
            return response.data;
        }, function (error) {
            console.log(error);
        }).catch(err => console.err);
    };

    function addGroupChat(data) {
        return $http({
            url: '/groupChat',
            headers: { 'Content-Type': 'application/json' },
            method: "POST",
            data: data
        }).then((response) => {
            return response.data;
        }).catch(err => console.err);
    }

    function addUserToRoom(data) {
        return $http({
            url: `/groupChat/${data.roomId}`,
            headers: { 'Content-Type': 'application/json' },
            method: "PUT",
            data: data
        }).then((response) => {
            return response.data;
        }).catch(err => console.err);
    }

    function removeUserFromRoom(data) {
        return $http({
            url: `/groupChat/${data.roomId}`,
            headers: { 'Content-Type': 'application/json' },
            method: "DELETE",
            data: data
        }).then((response) => {
            return response.data;
        }).catch(err => console.err);
    }

    function deleteRoom(data) {
        return $http({
            url: '/groupChat',
            headers: { 'Content-Type': 'application/json' },
            method: "DELETE",
            data: data
        }).then((response) => {
            return response.data;
        }).catch(err => console.err);
    };
}