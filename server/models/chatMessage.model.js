const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    chatId: Schema.Types.ObjectId,
    userId: Schema.Types.ObjectId,
    message: String,
    date: Date
});

mongoose.model('ChatMessage', chatSchema);