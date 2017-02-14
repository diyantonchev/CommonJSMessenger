// const express = require('express');
// const app = express();
// module.exports = function () {
    //
    // app.get('/users', (req, res) => {
    //     User
    //         .find({})
    //         .select('_id username fullName avatar')
    //         .where('_id').ne(req.query.loggedUser)
    //         .then((users) => {
    //             res.json(users);
    //         });
    // });
    //
    // app.post('/createRoom', (req, res) => {
    //     let roomName = req.body.name;
    //     let userName = req.body.user.username;
    //     let fullName = req.body.user.fullName;
    //     let userId = req.body.user.id;
    //
    //     new Room({name: roomName, users: [{username: userName,fullName: fullName, id: userId}], messages: []}).save((err, data) => {
    //         if (err) {
    //             console.log(err);
    //         }
    //
    //         res.json(data);
    //     });
    // });
    //
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
// }