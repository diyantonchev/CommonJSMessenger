angular.module('chat')
    .factory('dataservice', dataservice);

dataservice.$inject = ['$http'];
function dataservice($http) {

    let service = {
        login: login,
        createNewRoom: createNewRoom,
        getUsersData: getUsersData,
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

    function getUsersData(userId) {
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
    function login(userData) {
        return $http({
            url: '/login',
            headers: { 'Content-Type': 'application/json' },
            method: "POST",
            data: userData
        }).then((response) => {
            return response.data;
        }).catch(err => console.err);
    }

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