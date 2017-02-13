const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const socketStream = require('socket.io-stream');
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



// GET REQUESTS


app.get('/currentUserInfo',(req, res) => {
    User
        .findById(req.query.accessToken)
        .select('username fullName')
        .then((userData) => {
            res.json(userData);
        });
});

app.get('/fullNamesByString', (req, res) => {
    let regexp = new RegExp(req.query.searchString,"gui");
    User
        .find( { fullName: { $regex: regexp } })
        .select('fullName')
        .then((data) => {
            let result = JSON.parse(JSON.stringify(data));

            let final = result.map((item) =>{
                item.id = item._id;
                return item;
            });
            res.json(final);
        });
});

app.get('/chatHistoryBrief', (req, res) => {
    User
        .findById(req.query.accessToken)
        .select('history')
        .then((data) => {
        console.log('chatHistoryBrief', data);
            let result = JSON.parse(JSON.stringify(data.history));
            let final = result.map((item) =>{
                    item.id = item._id,
                    item.isFavourite =true,
                    item.isRoom =false,
                    item.isOnline =true,
                    item.lastChatMessageText ='Lorem ipsum dolor sit amet, consectetur...',
                    item.lastChatDate =new Date(2017, 2, 2)
                return item;
            });
            res.json(final);
        });
});







app.get('/getChatHistoryBrief', (req, res) => {
    /**
     * Result is supposed to be like that
     [
     {
         id::string,
         name::string,
         isFavourite::bool,
         isRoom::bool,
         isOnline::bool,
         lastChatMessageText::string,
         lastChatDate:: Date
     }
     ]
     */
});






app.get('/getMessagesBySearchstring ', (req, res) => {
    /**
     * params: -
         searchstring – searched string
         userID – mandatory, will search in specific chat session

        return: array of messageIDs that is matching the search pattern
         [
             {
                 messageID : 23423
             }
         ]
     */
});


app.get('/getChatHistory ', (req, res) => {
    /**
     * getChatHistory(user/roomID, lastMessageId)
     * userID/roomID – id related to the specific room
     * lastMessageId – last loaded messageID (so we can load 20 more for pagination)
      return: array of messages history notes
         [
             {
                 messageId::string,
                 authorName::string,
                 messageDate::Date,
                 messageBody::string,
                 messageType::int(plain text = 1, image = 2, file = 3)
             }
         ]
     */
});






app.get('/getMatchingUsername', (req, res) => {

    User
        .find({})
        .select('_id username fullName avatar')
        .where('_id').ne(req.searchString )
        .where('username').findOne({"username" : {$regex : ".*son.*"}})
        .then((users) => {
            res.json(users);
        });
    /*
    * [
         {name:”Ivan Ivanov”, id: 34},
         {name:”Dragan Ivanov”, id: 14}
      ]
     * */



});


app.get('/users', (req, res) => {
    User
        .find({})
        .select('_id username fullName avatar')
        .where('_id').ne(req.query.loggedUser)
        .then((users) => {
            res.json(users);
        });
});


// POST REQUESTS
app.post('/login', (req, res) => {
    let reqUser = req.body;
    User.findOne(reqUser)
        .select('_id').then((user) => {
        res.json({accessToken: user._id});
    }).catch( (err) => {
        res.status(418).send('Invalid username and/or password');
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

app.post('/favourite', (req, res) => {
    let user = req.body.data.user;
    let favUser = req.body.data.favUser;
    if (req.body.data.new) {
        User.findByIdAndUpdate(user._id, {
            $push: {
                "favourites": favUser
            }
        }, {safe: true, new: true, upsert: true}, (err, user) => {
            res.json(user.favourites);
        });
    }
    else {
        User.findByIdAndUpdate(user._id, {
            $pull: {
                "favourites": favUser
            }
        }, {safe: true, new: true, upsert: true}, (err, user) => {
            res.json(user.favourites);
        });
    }


});

app.post('/download', (req, res) => {
    let file = path.join(__dirname, 'public/files', req.body.filePath);
    res.download(file, req.body.filePath);
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
            .select('_id username fullName favourites')
            .then((user) => {

                let onlineUser = JSON.parse(JSON.stringify(user));
                onlineUser.online = true;
                if (users.findIndex(u => u._id == onlineUser._id) == -1) {
                    loggedUser = onlineUser;
                    users.push(onlineUser);
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
                    }).then(() => {
                        User.findByIdAndUpdate(data.user._id, {
                            $push: {
                                'history': {
                                    _id: data.friend._id,
                                    username: data.friend.username,
                                    fullName: data.friend.fullName
                                }
                            }
                        }, {safe: true, new: true, upsert: true}, (err, data) => {

                        });
                        User.findByIdAndUpdate(data.friend._id, {
                            $push: {
                                'history': {
                                    _id: data.user._id,
                                    username: data.user.username,
                                    fullName: data.user.fullName
                                }
                            }
                        }, {safe: true, new: true, upsert: true}, (err, data) => {

                        });
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


    // socket.on('leave-single-room', (data) => {

    // });


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

        Room.findById(data.room._id).then((room) => {
            let index = room.users.findIndex(user => user.id == data.user._id);
            let user = room.users[index];
            room.users.splice(index, 1);
            if (!room.users.length) {
                Room.remove({"_id": data.room._id}, (err, cb) => {
                    if (err) {
                        console.log(err);
                    }
                });
            }
            else {
                Room.findByIdAndUpdate(data.room._id, {
                    $set: {
                        'users': room.users
                    }
                }, {safe: true, new: true, upsert: true}, (err, newRoom) => {
                    if (err) {
                        console.log(err);
                    }
                    socket.leave(data.room._id);
                    io.sockets.to(data.room._id).emit('room-notifications', {newRoom: newRoom, userLeft: user});
                });
            }
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
        }, {safe: true, new: true, upsert: true}).then((err, room) => {
            if (err) {
                console.log(err);
            }

            io.sockets.to(data.room).emit('room-messages', {
                author: data.author,
                text: data.msg,
                date: Date.now(),
                isFile: false
            });

            socket.broadcast.emit('room-notifications', {
                roomId: data.room
            });
        });
    });
    //Socket file stream

    socketStream(socket).on('fileUpload', function (stream, data) {
        Chat.findByIdAndUpdate(data.roomId, {
            $push: {
                "messages": {
                    author: data.author,
                    date: Date.now(),
                    isFile: true,
                    extension: data.extension
                }
            }
        }, {
            safe: true,
            new: true,
            upsert: true
        }, (err, message) => {
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

    socketStream(socket).on('chatFileUpload', function (stream, data) {
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




});


http.listen(port, () => {
    console.log(`listening on ${port}`);
});
