const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    users:[
        {
            _id: false,
            username: String,
            fullName: String,
            id: Schema.ObjectId
        }
    ],
    messages: [
        {
            _id: false,
            author: String,
            text: String,
            date: Number
        }
    ]
});

mongoose.model('Room', roomSchema);