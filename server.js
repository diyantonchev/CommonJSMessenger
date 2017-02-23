const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const socketStream = require('socket.io-stream');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const async = require('async');
// const routes = require('./server/routes');

require('./server/models/user.model');
require('./server/models/chatUserRelation.model');
require('./server/models/chatMessage.model');


mongoose.Promise = global.Promise;
const port = 3000;
const connection = 'mongodb://localhost:27017/chat';

let User = mongoose.model('User');
let ChatUserRelation = mongoose.model('ChatUserRelation');
let ChatMessage = mongoose.model('ChatMessage');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
mongoose.connect(connection);
console.log('MongoDB up and running!');
// INSERTING VALUESSSSS

app.get('/fillChats', (req, res) => {

    // qwerty   =   589dbe874a1dad6d2e933fce
    // Syla     =   58876339aee27b2a20f1e80e
    // Drago    =   5887636bd31e7119948abad9


    // new ChatUserRelation(
    //     {
    //         "creatorId": req.query.accessToken || "589dbe874a1dad6d2e933fce",
    //         "participants": [
    //             "589dbe874a1dad6d2e933fce",
    //             "58876339aee27b2a20f1e80e"
    //         ]
    //     }
    // ).save(function (err, msg) {
    //     console.log('ChatUserRelation --> ', msg);
    // });

    // Adding chat messages to this chat
    // new ChatMessage({
    //     chatId: "58a599029c87b61b600fa279",
    //     userId: "589dbe874a1dad6d2e933fce",
    //     message: "Hi alll",
    //     date: new Date(2017,1,14)
    // }).save();
    // new ChatMessage({
    //     chatId: "58a599029c87b61b600fa279",
    //     userId: "58876339aee27b2a20f1e80e",
    //     message: "Hey, нямам какво да добавя",
    //     date: new Date(2017,1,14)
    // }).save();
});

// GET REQUESTS


app.get('/chatIdForUsers', (req, res) => {
    let inArr = [];
    let andArr = [];

    for (let v in req.query.arrayOfUsersIds) {
        if (!req.query.arrayOfUsersIds[v] || req.query.arrayOfUsersIds[v] == "undefined") {
            res.status(418).send({ "message": "Not a valid request." });
            return;
        }
        andArr.push({ "participants": { $in: [mongoose.Types.ObjectId(req.query.arrayOfUsersIds[v])] } })
    }
    andArr.push({ "participants": { $size: req.query.arrayOfUsersIds.length } });


    ChatUserRelation
        .find(
        {
            $and: andArr
        }
        )
        .select('_id')
        .then((userData) => {
            console.log('userData--->', userData);
            if (userData[0]) {
                res.json(userData[0]._id);
            } else {
                res.status(418).send({ "message": "No results found" });
            }
        }).catch(console.log);
});

app.get('/currentUserInfo', (req, res) => {
    User
        .findById(req.query.accessToken)
        .select('username fullName')
        .then((userData) => {
            res.json(userData);
        });
});

app.get('/fullNamesByString', (req, res) => {
    let regexp = new RegExp(req.query.searchString, "gui");
    User
        .find({ fullName: { $regex: regexp } })
        .select('fullName')
        .then((data) => {
            let result = JSON.parse(JSON.stringify(data));

            let final = result.map((item) => {
                item.id = item._id;
                return item;
            });
            res.json(final);
        });
});


app.get('/chatHistoryBrief', (req, res) => {
    ChatUserRelation
        .find({ $or: [{ creatorId: req.query.accessToken }, { participants: req.query.accessToken }] })
        .select('creatorId participants')
        .then((data) => {
            let result = JSON.parse(JSON.stringify(data));
            async.map(result, mapChats, function (err, chats) {
                res.json(chats);
            });

            function mapChats(chat, done) {
                chat.id = chat._id;
                chat.isRoom = chat.participants.length > 2;
                let userIds = chat.participants.map((p) => {
                    return mongoose.Types.ObjectId(p);
                });
                ChatMessage
                    .findOne({ 'chatId': chat._id }).sort({ 'date': 'descending' }).then(function (message) {
                        chat.lastChatMessageText = message.message;
                        chat.lastChatDate = message.date;
                        chat.userId = message.userId;

                    }).then(function () {
                        User
                            .find({ _id: { $in: userIds } }).then(function (userData) {
                                chat.participants = [];
                                for (v in userData) {
                                    chat.participants.push({ id: userData[v]._id, fullName: userData[v].fullName });
                                }
                                chat.lastChatSender = chat.participants.filter((p) => {
                                    return p.id.toString() === chat.userId.toString();
                                })[0];
                            }).then(() => {
                                done(null, chat);
                            });
                    });
            }

        }).catch(console.log);
});

app.get('/messagesBySearchstring', (req, res) => {
    let chatId = req.query.chatId;
    let regexp = new RegExp(req.query.searchedString, "gui");
    ChatMessage
        .find({ chatId: mongoose.Types.ObjectId(chatId), message: { $regex: regexp } })
        .then((messages) => {
            res.json(messages);
        })
});


app.get('/chatHistory', (req, res) => {
    ChatMessage
        .find({ chatId: mongoose.Types.ObjectId(req.query.chatId) })
        .then((messages) => {
            let resMessages = JSON.parse(JSON.stringify(messages)).map((msg) => {
                return {
                    messageid: msg._id,
                    authorName: 'Za sega Pesho', //TODO
                    userid: msg.userid,
                    date: msg.date,
                    message: msg.message,
                    messageType: 1 //TODO
                }
            });

            res.json(resMessages);
        });
});


app.get('/getMatchingUsername', (req, res) => {
    console.log('getMatchingUsername');
    User
        .find({})
        .select('_id username fullName avatar')
        .where('_id').ne(req.query.searchString)
        .where('username').findOne({ "username": { $regex: ".*son.*" } })
        .then((users) => {
            res.json(users);
        });
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
            res.json({ accessToken: user._id });
        }).catch((err) => {
            res.status(418).send('Invalid username and/or password');
        });
});

app.post('/createChat', (req, res) => {
    let creatorid = req.body.participants[0];
    let participants = req.body.participants;

    ChatUserRelation({
        creatorId: creatorid,
        participants: participants
    }).save().then(function (response) {
        res.json({ "chatid": response._id });
    });
});

Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
var onlineUsers = {};
io.sockets.on('connection', (client) => {


    client.on('user connected', function (data) {
        onlineUsers[data.accessToken] = {
            client: client
        };
        console.log(data.accessToken + ' connected', 'total online (' + Object.size(onlineUsers) + ')');


        onlineUsers[data.accessToken].client.on('message', (data) => {
            //Insert into DB
            new ChatMessage({
                chatId: data.chatid,
                userId: data.userid,
                message: data.message,
                date: new Date()
            }).save(function (error, response) {
                if (error) {
                    console.log(error);
                } else {
                    ChatUserRelation
                        .findById(mongoose.Types.ObjectId(data.chatid))
                        .select('participants')
                        .then(function (result) {
                            for (let v in result.participants) {
                                let participant = result.participants[v];
                                if (!onlineUsers[participant] || !onlineUsers[participant].client) continue;
                                onlineUsers[participant].client.emit('new message', {
                                    messageid: response._id,
                                    chatId: response.chatId,
                                    date: response.date,
                                    message: response.message,
                                    userId: response.userId,
                                });

                                if (participant != data.userid) {
                                    onlineUsers[participant].client.emit('new message notification', {
                                        chatId: response.chatId,
                                        message: response.message,
                                        userId: response.userId
                                    })
                                }

                            }
                        });
                }

            });
        });


    });
    client.on('disconnect', function (data) {
        for (let v in onlineUsers) {
            if (onlineUsers[v].client.id == client.id) {
                delete onlineUsers[v];
                break;
            }
        }
        console.log(data.accessToken, 'connected', client.id + ' went offline (' + Object.size(onlineUsers) + ')');
    });


    // Server needs to be an ALL POSSIBLE ROOMS
    // ChatUserRelation
    //     .find({$or: [{creatorId: req.query.accessToken}, {participants: req.query.accessToken}]})
    //     .select('_id')
    //     .then((data) => {
    //         for (let v in data) {
    //             client.join(data[v]._id);
    //         }
    //     });
});


http.listen(port, () => {
    console.log(`The server is listening on port: ${port}`);
});