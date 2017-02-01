const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({

    user1: {
        // _id: false,
        _id: String,
        username: String,
        fullName: String
    },
    user2: {
        // _id: false,
        _id: String,
        username: String,
        fullName: String
    },
    messages: [
        {
            author: String,
            text: String,
            date: Number,
            isFile: Boolean,
            fileName: String,
            isImage: Boolean
        }
    ]

});

mongoose.model('Chat', chatSchema);