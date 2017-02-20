const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const socketStream = require('socket.io-stream');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
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


app.use(bodyParser.urlencoded({extended: true}));
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
    console.log(req.query.arrayOfUsersIds);

    ChatUserRelation
        .find(
            {
                $and:[
                    {participants : 'this.participants.length = '+req.query.arrayOfUsersIds}
                ]
            }
        )
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
        .find({fullName: {$regex: regexp}})
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
        .find({$or: [{creatorId: req.query.accessToken}, {participants: req.query.accessToken}]})
        .select('creatorId participants')
        .then((data) => {
            let result = JSON.parse(JSON.stringify(data));
            let chat = [];
            let v;
            for (v in result) {
                result[v].id = result[v]._id;
                result[v].isRoom = result[v].participants.length > 2;
                ChatMessage
                    .findOne({'chatId': result[v]._id}).sort({'date': 'descending'}).then(function (message) {
                    result[v].lastChatMessageText = message.message;
                    result[v].lastChatDate = message.date;
                    result[v].userId = message.userId;
                }).then(function () {
                    User
                        .findById(result[v].userId).then(function (userData) {
                        result[v].fullName = userData.fullName;
                        result[v].avatar = userData.avatar;
                        result[v].isOnline = true; // simulate online
                        result[v].isFavourite = true; // simulate favourite user
                        chat.push(result[v])
                    });
                });
            }

            // lame
            setTimeout(function () {
                res.json(chat);
            }, 500)

        }).catch(console.log);
});

app.get('/getMessagesBySearchstring', (req, res) => {
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


app.get('/chatHistory', (req, res) => {
    console.log('get chatHistory',req.query)
    ChatMessage
        .find({chatId: mongoose.Types.ObjectId(req.query.chatId)})
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
        .where('_id').ne(req.searchString)
        .where('username').findOne({"username": {$regex: ".*son.*"}})
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
        res.json({accessToken: user._id});
    }).catch((err) => {
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

io.sockets.on('connection', (socket) => {
    console.log('socket: on connection');

    socket.on('message', (data) => {
        //Insert into DB
        console.log('socket: on message');

        new ChatMessage({
            chatId: data.chatid,
            userId: data.userid,
            message: data.message,
            date: new Date()
        }).save(function (error, response) {
            if (error) {
                console.log(error);
            } else {
                socket.emit('messageReceivedByServer', {
                    messageid: response._id,
                    chatId: response.chatId,
                    date: response.date,
                    message: response.message,
                    userId: response.userId,
                });
            }

        });
    });



    socket.on('user-disconnected', () => {
        // TODO:
        console.log('socket: on user-disconnected');
    });




})
;


http.listen(port, () => {
    console.log(`The server is listening on port: ${port}`);
});
