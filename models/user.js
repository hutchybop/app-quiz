const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    answers: [String]

})

const User = mongoose.model('User', UserSchema);
module.exports.User = User