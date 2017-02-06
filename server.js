const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ss = require('socket.io-stream');
const path = require('path');
let fs = require('fs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// const routes = require('./server/routes');
require('./server/models/user.model');
require('./server/models/room.model');
require('./server/models/chat.model');

mongoose.Promise = Promise;

const port = 3000;
const connection = 'mongodb://localhost:27017/chat';

let User = mongoose.model('User');
let Chat = mongoose.model('Chat');
let Room = mongoose.model('Room');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(connection);

console.log('MongoDB up and running!');

app.post('/login', (req, res) => {

    let reqUser = req.body;
    User.findOne(reqUser)
        .select('_id username fullName').then((user) => {
        res.json(user);
    });

});

let users = [];

io.sockets.on('connection', (socket) => {

    let loggedUser = '';

    console.log('A client is connected!');

    socket.emit('login', 'You are logged in!');

    socket.on('disconnect', () => {
        console.log('Client has Disconnected!');
        users.splice(users.indexOf(loggedUser), 1);
        io.sockets.emit('users', users);
    });

    socket.on('users', (userId) => {


        User.findById(userId)
            .select('_id username fullName')
            .then((user) => {

                if (users.indexOf(JSON.stringify(user)) == -1) {

                    loggedUser = JSON.stringify(user);
                    users.push(JSON.stringify(user));

                }
                io.sockets.emit('users', users);
            });
    });

    socket.on('join-single-room', (data) => {
        Chat.findOne(
            {
                $or: [
                    {
                        'user1._id': data.user._id, 'user2._id': data.friend._id
                    }, {
                        'user1._id': data.friend._id, 'user2._id': data.user._id
                    }
                ]
            }
            ,
            (err, doc) => {
                if (!doc) {
                    new Chat({
                        user1: data.user,
                        user2: data.friend,
                        messages: []
                    }).save((err, data) => {
                        if (err) {
                            console.log(err);
                        }
                        socket.join(data._id);
                        socket.emit('chats', data);
                    });
                }
                else {
                    socket.join(doc._id);
                    socket.emit('chats', doc);
                }
            }
        );
    });

    socket.on('chat-connection', (data) => {
        Chat.findByIdAndUpdate(data.room, {
            $push: {
                "messages": {
                    author: data.author,
                    text: data.msg,
                    date: Date.now(),
                    isFile: false
                }
            }
        }, {safe: true, new: true, upsert: true}).then((room) => {

            io.sockets.to(data.room).emit('chat-connection', {
                author: data.author,
                text: data.msg,
                date: Date.now(),
                isFile: false
            });
            io.sockets.to(data.friend).emit('notifications', {newText: true, author: data.author});
        });

    });


    socket.on('leave-single-room', (data) => {

    });


    socket.on('rooms', (userId) => {
        socket.join(userId);
        Room
            .find({users: {$elemMatch: {id: userId}}})
            .then((rooms) => {

                rooms.forEach((room) => {
                    io.sockets.to(userId).emit(userId, room);
                });


            }, (err) => {
                if (err) {
                    console.log(err);
                }
            });
    });

    socket.on('join-user-to-room', (data) => {
        Room.findByIdAndUpdate(data.roomInstance._id, {
            $addToSet: {
                "users": {
                    username: data.user.username,
                    fullName: data.user.fullName,
                    id: data.user._id
                }
            }
        }, {safe: true, new: true, upsert: true}).then((room) => {
            io.sockets.to(data.user._id).emit(data.user._id, room);
        });
    });

    socket.on('join-room', (data) => {
        socket.join(data.room._id);
        Room.findById(data.room._id).then((roomData) => {
            io.sockets.to(data.user._id).emit('room-connections', roomData);
        });
    });

    socket.on('leave-room', (data) => {
        socket.leave(data.room._id);
        Room.findById(data.room._id).then((room) => {
            let index = room.users.findIndex(user => user.id == data.user._id);
            room.users.splice(index, 1);
            Room.findByIdAndUpdate(data.room._id, {
                $set: {
                    'users':room.users
                }
            },{safe: true, new: true, upsert: true}, (err, newRoom) => {
                if(err){
                    console.log(err);
                }

                // io.sockets.to(data.room._id).emit('room-messages', roomData);
            });
        });
    });

    socket.on('room-messages', (data) => {
        Room.findByIdAndUpdate(data.room, {
            $push: {
                "messages": {
                    author: data.author,
                    text: data.msg,
                    date: Date.now(),
                    isFile: false
                }
            }
        }, {safe: true, new: true, upsert: true}).then((err) => {
            if (err) {
                console.log(err);
            }

            io.sockets.to(data.room).emit('room-messages', {
                author: data.author,
                text: data.msg,
                date: Date.now(),
                isFile: false
            });
        });
    });
    //Socket file stream

    ss(socket).on('fileUpload', function (stream, data) {
        Chat.findByIdAndUpdate(data.roomId, {
            $push: {
                "messages": {
                    author: data.author,
                    date: Date.now(),
                    isFile: true,
                    extension: data.extension
                }
            }
        }, {safe: true, new: true, upsert: true}, (err, message) => {
            if (err) {
                console.log(err);
            }

            let msg = message.messages[message.messages.length - 1];
            let filename = path.join(__dirname, 'public/files', `${msg._id}.${msg.extension}`);

            stream.on('finish', () => {
                io.sockets.to(data.roomId).emit('chat-connection', msg);
            });
            stream.pipe(fs.createWriteStream(filename));
        });
    });

    ss(socket).on('chatFileUpload', function (stream, data) {
        Room.findByIdAndUpdate(data.roomId, {
            $push: {
                "messages": {
                    author: data.author,
                    date: Date.now(),
                    isFile: true,
                    extension: data.extension
                }
            }
        }, {safe: true, new: true, upsert: true}, (err, message) => {
            if (err) {
                console.log(err);
            }

            let msg = message.messages[message.messages.length - 1];
            let filename = path.join(__dirname, 'public/files', `${msg._id}.${msg.extension}`);

            stream.on('finish', () => {
                io.sockets.to(data.roomId).emit('room-messages', msg);
            });
            stream.pipe(fs.createWriteStream(filename));
        });
    });

    // Routes

    app.get('/users', (req, res) => {
        User
            .find({})
            .select('_id username fullName avatar')
            .where('_id').ne(req.query.loggedUser)
            .then((users) => {
                res.json(users);
            });
    });

    app.post('/createRoom', (req, res) => {
        let roomName = req.body.name;
        let userName = req.body.user.username;
        let fullName = req.body.user.fullName;
        let userId = req.body.user.id;

        new Room({
            name: roomName,
            users: [{username: userName, fullName: fullName, id: userId}],
            messages: []
        }).save((err, data) => {
            if (err) {
                console.log(err);
            }

            res.json(data);
        });
    });

    // app.get('/getRooms', (req, res) => {
    //     Room
    //         .find({users: {$elemMatch: {id: req.query.loggedUser}}})
    //         .then((rooms) => {
    //
    //             rooms.forEach((room) => {
    //                 if (!socket.rooms[room._id]) {
    //                     socket.join(room._id);
    //                 }
    //             });
    //
    //             res.json(rooms);
    //
    //
    //         }, (err) => {
    //             if (err) {
    //                 console.log(err);
    //             }
    //         });
    // });

    app.get('/download', (req, res) => {
        let file = path.join(__dirname, 'public/files' , req.query.filePath);
        res.download(file);
    });


});


http.listen(port, () => {
    console.log(`listening on ${port}`);
});
