const mongoose = require('mongoose');

const messagesSchema = mongoose.Schema({
    name: String,
    msg: String,
    time: Number,
	clientID: Number,
});

module.exports = mongoose.model('Messages', messagesSchema);