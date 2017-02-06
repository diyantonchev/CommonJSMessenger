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
            author: String,
            text: String,
            date: Number,
            isFile: Boolean,
            extension: String
        }
    ]
});

mongoose.model('Room', roomSchema);