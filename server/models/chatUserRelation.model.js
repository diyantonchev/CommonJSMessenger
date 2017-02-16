const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    creatorId: Schema.Types.ObjectId,
    participants: [Schema.Types.ObjectId]
});

mongoose.model('ChatUserRelation', chatSchema);