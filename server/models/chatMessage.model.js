const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    chatHash: String,
    userId: Schema.Types.ObjectId,
    message : String,
    date : Date
});

mongoose.model('ChatMessage', chatSchema);
