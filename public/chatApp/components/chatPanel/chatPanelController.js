angular.module('chat').controller('ChatPanelCtrl', ChatPanelCtrl);

ChatPanelCtrl.$inject = ['$scope', '$timeout', '$q', 'dataService', 'notifier'];

function ChatPanelCtrl($scope, $timeout, $q, dataService, notifier) {



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

    // Autocomplete

    function getFullNamesByString() {
        let deferred = $q.defer();
        if (vm.usersByNameAutocompletePromise) $timeout.cancel(vm.usersByNameAutocompletePromise);
        vm.usersByNameAutocompletePromise = $timeout(function () {
            dataService.getFullNamesByString(vm.searchText).then(function (data) {
                console.log('controller-->',data);
                deferred.resolve(data);
            });
        }, 500);
        return deferred.promise;
    }

    function onAutocompleteSelect(userId) {
        console.log('onAutocompleteSelect',userId)
    }
    //Autocomplete END





    //
    //Init Variables
    vm.chatToggle = false;
    vm.roomToggle = false;
    vm.singleToggle = false;
    vm.rooms = [];
    vm.users = [];
    vm.offlineUsers = [];
    vm.favUsers = [];
    vm.chatInstance = {};
    vm.roomInstance = {};

    vm.panelsToggle = panelsToggle;
    vm.changeChatInstance = changeChatInstance;
    vm.sendMsgToChatInstance = sendMsgToChatInstance;
    vm.createRoom = createRoom;
    vm.changeRoomInstance = changeRoomInstance;
    vm.sendMsgToRoomInstance = sendMsgToRoomInstance;
    vm.addUserToRoom = addUserToRoom;
    vm.leaveRoom = leaveRoom;
    vm.fileUpload = fileUpload;
    vm.chatFileUpload = chatFileUpload;
    vm.fileDownload = fileDownload;
    vm.switchFavourite = switchFavourite;

    document.addEventListener('New Message', function (ev) {
        let friend = vm.users.find(u => u.fullName == ev.detail.author);
        vm.chatToggle = true;
        vm.changeChatInstance(friend);
    });

    //Init Functions
    // getAllUsers();

    //Sockets

    vm.socket = io.connect();

    vm.socket.on('connect_error', function (err) {
        let url = "http://" + $window.location.host + "/disconnect";
        $window.location.href = url;
    });

    //
    // vm.socket.on('login', (message) => {
    //     vm.socket.emit('users', $scope.user._id);
    //     vm.socket.emit('rooms', $scope.user._id);
    // }, (err) => {
    //     console.log(err);
    // });

    vm.socket.on('users', (data) => {
        if (vm.users.length < 1 && vm.users.length < data.length) {
            console.log(data, 'first if')
            vm.users = data;
        } else if (vm.users.length >= 1 && vm.users.length <= data.length) {
            console.log(data, 'second if')
            let newUsers = [];
            data.forEach(newUser => {
                if (!vm.users.some(s => s._id == newUser._id)) {
                    newUsers.push(newUser);
                }
            });
            // newUsers.forEach(user => {
            //     vm.users.push(user);
            //     let index = vm.offlineUsers.findIndex(i => i._id == user._id);
            //     if (index != -1) {
            //         vm.offlineUsers.splice(index, 1);
            //     }
            // });
        }
        else if (vm.users.length >= 1 && vm.users.length > data.length) {
            console.log(data, 'third if')
            vm.users.forEach(user => {
                if (data.findIndex(i => i._id == user._id) == -1) {
                    let index = vm.users.findIndex(i => i._id == user._id);
                    vm.users.splice(index, 1);
                }
                let index = vm.offlineUsers.findIndex(i => i._id == user._id);
                if (index == -1 && $scope.user.history.findIndex(i => i._id == user._id) != -1) {
                    let offUser = $scope.user.history.find(u => u._id === user._id);
                    vm.offlineUsers.push(offUser);
                }
            });
        }
        vm.users.forEach(user => {
            if ($scope.user.favourites.findIndex(favUser => favUser._id === user._id) != -1) {
                user.favourite = "star";
            }
            else {
                user.favourite = "star_border";
            }
        });
        if (vm.offlineUsers.length < 1) {
            vm.offlineUsers = [];
            $scope.user.history.forEach(user => {
                if (vm.users.findIndex(u => u._id == user._id) == -1) {
                    vm.offlineUsers.push(user);
                }
            });
        }
        /*else if(vm.offlineUsers.length >= 1){

         }*/
        vm.offlineUsers.forEach(user => {
            if ($scope.user.favourites.findIndex(favUser => favUser._id === user._id) != -1) {
                user.favourite = "star";
            }
            else {
                user.favourite = "star_border";
            }
        });

        $scope.$apply();
    });

    vm.socket.on('chats', (data) => {
        vm.chatInstance._id = data._id;
        vm.chatInstance.friend = data.friend;
        vm.chatInstance.friendId = data.friendId;
        vm.chatInstance.user1 = data.user1;
        vm.chatInstance.user2 = data.user2;
        vm.chatInstance.messages = [];
        data.messages.forEach((msg) => {
            if ($scope.user.fullName == msg.author) {
                msg.styleClass = 'user'
            }
            else {
                msg.styleClass = 'friend'
            }
            if (!msg.isFile) {
                vm.chatInstance.messages.push(msg);
            }
            else {
                if (msg.extension == "jpg" || msg.extension == "png") {
                    msg.isImg = true;
                    vm.chatInstance.messages.push(msg);
                }
                else {
                    msg.isImg = false;
                    vm.chatInstance.messages.push(msg);
                }
            }
        });
        if (vm.chatInstance.user1._id == $scope.user._id) {
            vm.chatInstance.friend = vm.chatInstance.user2.fullName;
            vm.chatInstance.friendId = vm.chatInstance.user2._id;
        }
        else {
            vm.chatInstance.friend = vm.chatInstance.user1.fullName;
            vm.chatInstance.friendId = vm.chatInstance.user1._id;
        }
        $scope.$apply();
    });

    //
    vm.socket.on('notifications', (data) => {
        if (vm.chatInstance.friend != data.author) {
            let user = vm.users.filter((user) => {
                return user.fullName == data.author;
            })[0];
            user.newText = true;
            if (Object.keys(vm.chatInstance).length === 0 && vm.chatInstance.constructor === Object) {
                notifier.notifyMe('New message', `${data.author} messaged you`, data);
            }

            $scope.$apply();
        }
    });

    // room connection but for p2p
    vm.socket.on('chat-connection', (msg) => {

        if ($scope.user.fullName == msg.author) {
            msg.styleClass = 'user'
        }
        else {
            msg.styleClass = 'friend'
        }
        if (!msg.isFile) {
            vm.chatInstance.messages.push(msg);
        }
        else {
            if (msg.extension == "jpg" || msg.extension == "png") {
                msg.isImg = true;
                vm.chatInstance.messages.push(msg);
            }
            else {
                msg.isImg = false;
                vm.chatInstance.messages.push(msg);
            }
        }
        $scope.$apply();

    });

    // Seperate channel for
    vm.socket.on(vm.accessToken, (data) => {
        let isRoom = false;
        vm.rooms.forEach(room => {
            if (room._id == data._id) {
                isRoom = true;
            }
        });
        if (!isRoom) {
            vm.rooms.push(data);
        }
        $scope.$apply();
    });

    // on old message
    vm.socket.on('room-connections', (data) => {
        vm.roomInstance._id = data._id;
        vm.roomInstance.name = data.name;
        vm.roomInstance.users = data.users;
        vm.roomInstance.messages = [];
        data.messages.forEach(msg => {
            if ($scope.user.fullName == msg.author) {
                msg.styleClass = 'user'
            }
            else {
                msg.styleClass = 'friend'
            }
            if (!msg.isFile) {
                vm.roomInstance.messages.push(msg);
            }
            else {
                if (msg.extension == "jpg" || msg.extension == "png") {
                    msg.isImg = true;
                    vm.roomInstance.messages.push(msg);
                }
                else {
                    msg.isImg = false;
                    vm.roomInstance.messages.push(msg);
                }
            }
            $scope.$apply();
        });
    });

    // onNew message
    vm.socket.on('room-messages', (msg) => {
        if (Object.keys(vm.roomInstance).length > 0 && vm.roomInstance.constructor === Object) {

            if ($scope.user.fullName == msg.author) {
                msg.styleClass = 'user'
            }
            else {
                msg.styleClass = 'friend'
            }
            if (!msg.isFile) {
                vm.roomInstance.messages.push(msg);
            }
            else {
                if (msg.extension == "jpg" || msg.extension == "png") {
                    msg.isImg = true;
                    vm.roomInstance.messages.push(msg);
                }
                else {
                    msg.isImg = false;
                    vm.roomInstance.messages.push(msg);
                }
            }
            $scope.$apply();
        }
    });


    // on user Leave
    vm.socket.on('room-notifications', (data) => {
        if (data.roomId) {
            if (Object.keys(vm.roomInstance).length === 0 && vm.roomInstance.constructor === Object) {
                let index = vm.rooms.findIndex(room => room._id == data.roomId);
                vm.rooms[index].newText = true;
            }
        }
        else {
            vm.roomInstance.users = data.newRoom.users;
            vm.roomInstance.messages.push({
                isFile: false,
                isLeave: true,
                text: data.userLeft.username + " has left the room",
                date: Date.now()
            });
        }
        $scope.$apply();
    });


    //Function Declarations

    function getAllUsers() {
        return dataservice.getAllUsers($scope.user._id).then((users) => {
            vm.users = JSON.parse(JSON.stringify(users))
            vm.allUsers = users;
        }, (err) => {
            console.log(err);
        });
    }

    function panelsToggle() {
        vm.chatToggle = !vm.chatToggle;
        vm.roomToggle = false;
        vm.singleToggle = false;
    }

    function changeChatInstance(friend) {
        vm.socket.emit('join-single-room', {user: $scope.user, friend: friend});

        let user = vm.users.filter((user) => {
            return user._id == friend._id;
        })[0];

        if (user != undefined) {
            user.newText = false;
        }
        vm.roomToggle = false;
        vm.singleToggle = true;

    }

    function sendMsgToChatInstance(room, msg) {
        vm.socket.emit('chat-connection', {
            room: room._id,
            msg: msg,
            author: $scope.user.fullName,
            friend: room.friendId
        });
    }

    function changeRoomInstance(room) {
        vm.socket.emit('join-room', {room: room, user: $scope.user});
        vm.roomToggle = true;
        vm.singleToggle = false;
        room.newText = false;
    }

    function sendMsgToRoomInstance(room, msg) {
        vm.socket.emit('room-messages', {
            room: room._id,
            msg: msg,
            author: $scope.user.fullName
        });
    }

    function createRoom(roomName) {
        dataservice.createNewRoom({
            name: roomName,
            user: {username: $scope.user.username, fullName: $scope.user.fullName, id: $scope.user._id}
        }).then(function (room) {
            vm.rooms.push(room);
        });
    }

    function addUserToRoom(user, roomInstance) {
        vm.socket.emit('join-user-to-room', {user: user, roomInstance: roomInstance});
        vm.roomInstance.users.push({
            id: user._id,
            fullName: user.fullName,
            username: user.username
        });
    }

    function leaveRoom(roomInstance) {
        let index = vm.rooms.findIndex(room => room._id == roomInstance._id);
        vm.rooms.splice(index, 1);
        vm.socket.emit('leave-room', {user: $scope.user, room: roomInstance});
    }

    function fileUpload(file) {
        let fileExtension = file.name.split('.').pop();

        let stream = ss.createStream();
        // upload a file to the server.
        ss(vm.socket).emit('fileUpload', stream,
            {
                size: file.size,
                extension: fileExtension,
                roomId: vm.chatInstance._id,
                author: $scope.user.fullName,
            });
        ss.createBlobReadStream(file).pipe(stream);

    }

    function chatFileUpload(file) {
        let fileExtension = file.name.split('.').pop();
        let stream = ss.createStream();
        // upload a file to the server.
        ss(vm.socket).emit('chatFileUpload', stream,
            {
                size: file.size,
                extension: fileExtension,
                roomId: vm.roomInstance._id,
                author: $scope.user.fullName,
            });
        ss.createBlobReadStream(file).pipe(stream);
    }

    function fileDownload(filePath, fileExtension) {
        let file = filePath + '.' + fileExtension;
        dataservice.downloadFile(file).then((response) => {
            let a = document.createElement('a');
            a.setAttribute('style', 'display:none');
            a.setAttribute('href', 'data:application/octet-stream,' + encodeURIComponent(response));
            a.setAttribute('download', (filePath || 'Export') + '.' + fileExtension)
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }

    function switchFavourite(favUser, user) {
        if (user.favourites.findIndex(u => u._id === favUser._id) == -1) {
            dataservice.switchFavourite({
                favUser: favUser,
                user: user,
                new: true
            }).then((response) => {
                $scope.user.favourites = response;
                favUser.favourite = 'star';
            });
        }
        else {
            dataservice.switchFavourite({
                favUser: favUser,
                user: user,
                new: false
            }).then((response) => {
                $scope.user.favourites = response;
                favUser.favourite = 'star_border';
            });
        }
    }


};