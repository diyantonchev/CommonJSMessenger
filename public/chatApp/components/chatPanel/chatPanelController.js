angular.module('chat').controller('ChatPanelCtrl', ChatPanelCtrl);

ChatPanelCtrl.$inject = ['$scope', 'dataservice', '$sce'];

function ChatPanelCtrl($scope, dataservice, $sce) {


    let vm = this;

    //Init Variables
    vm.chatToggle = false;
    vm.roomToggle = false;
    vm.singleToggle = false;
    vm.rooms = [];
    vm.users = [];
    vm.chatInstance = {};
    vm.roomInstance = {};

    vm.panelsToggle = panelsToggle;
    vm.changeChatInstance = changeChatInstance;
    vm.sendMsgToChatInstance = sendMsgToChatInstance;
    vm.createRoom = createRoom;
    vm.changeRoomInstance = changeRoomInstance;
    vm.sendMsgToRoomInstance = sendMsgToRoomInstance;
    vm.addUserToRoom = addUserToRoom;
    vm.fileUpload = fileUpload;
    vm.downloadFile = downloadFile;
    //Init Functions
    // getUsersData();

    //Sockets

    vm.socket = io.connect();

    vm.socket.on('login', (message) => {
        vm.socket.emit('users', $scope.user._id);
        vm.socket.emit('rooms', $scope.user._id);
    });

    vm.socket.on('users', (data) => {
        vm.users = data.map((user) => {
            return JSON.parse(user);
        });
        $scope.$apply();
    });

    vm.socket.on($scope.user._id, (data) => {
        vm.rooms.push(data);
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
            if(!msg.isFile) {
                vm.chatInstance.messages.push(msg);
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


    vm.socket.on('notifications', (data) => {
        if (vm.chatInstance.friend != data.author) {
            let user = vm.users.filter((user) => {
                return user.fullName == data.author;
            })[0];
            user.newText = true;
            $scope.$apply();
        }
    });

    vm.socket.on('chat-connection', (msg) => {
        if ($scope.user.fullName == msg.author) {
            msg.styleClass = 'user'
        }
        else {
            msg.styleClass = 'friend'
        }
        vm.chatInstance.messages.push(msg);
        $scope.$apply();
    });

    vm.socket.on('chat-connection-file', (file) => {
        if ($scope.user.fullName == file.author) {
            file.styleClass = 'user'
        }
        else {
            file.styleClass = 'friend'
        }
        if (file.isImage) {
            let img = $sce.trustAsHtml(`<img class="msg-img" src="${file.text}" title="${file.date}"/>`);
            vm.chatInstance.messages.push({
                text: img,
                author: file.author,
                styleClass: file.styleClass,
                date: file.date
            });
        }
        else {
            vm.chatInstance.messages.push({
                data: file.text,
                text: file.fileName,
                _id: file._id,
                author: file.author,
                styleClass: file.styleClass,
                date: file.date,
                isFile: true
            });
        }
        $scope.$apply();
    });

    vm.socket.on('room-connections', (data) => {
        vm.roomInstance = data;
    });

    vm.socket.on('room-messages', (msg) => {
        vm.roomInstance.messages.push(msg);
        $scope.$apply();
    });

    vm.socket.on('room-notifications', (data) => {

    });


    //Function Declarations

    function getUsersData() {
        return dataservice.getUsersData($scope.user._id).then((users) => {
            vm.users = users;

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
        user.newText = false;
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

    function createRoom(roomName) {
        dataservice.createNewRoom({
            name: roomName,
            user: {username: $scope.user.username, fullName: $scope.user.fullName, id: $scope.user._id}
        }).then(function (room) {
            vm.rooms.push(room);
        });
    }

    function changeRoomInstance(room) {
        vm.socket.emit('join-room', room);
        vm.roomToggle = true;
        vm.singleToggle = false;
    }

    function sendMsgToRoomInstance(room, msg) {
        vm.socket.emit('room-messages', {room: room._id, msg: msg, author: $scope.user.fullName});
    }

    function addUserToRoom(user, roomInstance) {
        vm.socket.emit('join-user-to-room', {user: user, roomInstance: roomInstance});
    }

    function fileUpload(value, name) {
        console.log(value);
        let fullPath = name;
        if (fullPath) {
            let startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
            let filename = fullPath.substring(startIndex);
            if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
                filename = filename.substring(1);
            }
            fullPath = filename;
        }
        vm.socket.emit('chat-connection-file', {
            room: vm.chatInstance._id,
            fileData: value,
            fileName: fullPath,
            author: $scope.user.fullName,
            friend: vm.chatInstance.friendId
        });
    }

    function downloadFile(text, id) {
        console.log(1);
    }


};