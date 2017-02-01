const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true},
    fullName: { type: String, required: true},
    password: { type: String, required: true },
    isAdmin: Boolean,
    avatar: String,
});

mongoose.model('User', userSchema);