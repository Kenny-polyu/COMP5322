const mongoose = require('mongoose');

const accountSchema = mongoose.Schema({
    login: String,
    pw: String,
    id: String,
});

module.exports = mongoose.model('Account', accountSchema);