const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuizSchema = new Schema({
    gameInProgress: {
        type: Boolean
    },
    cat: [String],
    correct: [String],
    answers: [[String]],
    quest: [String],
    diff: [String],
    x: {Number},
    state: {String}

})

const Quiz = mongoose.model('Quiz', QuizSchema);
module.exports.Quiz = Quiz