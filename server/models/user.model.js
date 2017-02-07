const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true},
    fullName: { type: String, required: true},
    password: { type: String, required: true },
    isAdmin: Boolean,
    avatar: String,
    favourites: [
        {
            _id: false,
            _id: Schema.ObjectId
        }
    ]
});

mongoose.model('User', userSchema);