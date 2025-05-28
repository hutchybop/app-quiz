// INDEX - index (GET)
const { User } = require('../models/user')
const { Quiz } = require('../models/quiz')
const mongoose = require('mongoose');
const axios = require('axios');


module.exports.index = async (req, res) => {

    // Checks whether a quiz is in progress
    const quiz = await Quiz.findOne({_id: "657227d8fd2109cc5cd75df7"})
    const users = await User.find()
    let inProgress = quiz.gameInProgress
    let gameState = JSON.stringify(quiz.state)
    let userListParse = []

    // Adds all the userNames to userList array to sent to to lobby.ejs
    for(u of users){
        userListParse.push(u.userName)
    }

    const userList = JSON.stringify(userListParse)

    // Uses the queryParam from lobbyPOST to see if the user has entered a userName already in use
    const checkDupe = req.query
    let dupe = false
    if(checkDupe.dupe){
        dupe = true
    }

    res.render('quiz/index', {inProgress, dupe, userList, gameState, title: 'Start Your Quiz', page: 'index'})  
}


// LOBBY - lobby (POST)
module.exports.lobbyPost = async (req, res) => {

    const userName = req.body.userName

    // Each new user that enters is entered into the db
    const checkUser = await User.find({userName: userName})
    // The if formular, checks if the userName is already in the db,
    // if not it creates the user and redirects to lobby 
    // if it is they are redirected to back to index with the queryParam
    if(checkUser.length === 0){
        const newUser = new User({
            userName: userName,
            answers: []
        })
        await newUser.save()
    }else{
        return res.redirect('/?dupe=true')
    }

    // Emits newUser signal to lobby.ejs with the newUser variable
    ioSocket.emit('newUser', userName)
    
    // Query param is used in the app.js middleware to detect a newuser
    res.redirect('/lobby')

}

// LOBBY - lobby (GET)
module.exports.lobby = async (req, res) => {

    const users = await User.find()
    let userList = []

    // Adds all the userNames to userList array to sent to to lobby.ejs
    for(u of users){
        userList.push(u.userName)
    }

    return res.render('quiz/lobby', {userList, title: 'Lobby', page: 'lobby'})
    
}


// START - start (POST)
module.exports.startPost = async (req, res) => {

    // Code below, requests the questions from the api,
    // adds all the relevant question info the the db,
    // changes the gameInPrgress to true and redirects to quiz
    // Once this happens everone in lobby will automatically enter the quiz 
    // as the lobby page automatically refreshes

    const questDiff = req.body.diff
    const amount = req.body.amount / 10
    let x = 0
    let cat = []
    let correct = []
    let answers = []
    let quest = []
    let diff = []

    // Times run depends on the amount of questions desired, eg 20 questions, run 2 times
    for (let i = 1; i <= amount; i++){

        const questions = await axios.get('https://the-trivia-api.com/v2/questions?difficulties=' + questDiff);

        for(q of questions.data){
            cat.push(q.category)
            correct.push(q.correctAnswer)
            answers.push(q.incorrectAnswers)
            quest.push(q.question.text)
            diff.push(q.difficulty)
        };

        await Quiz.findOneAndUpdate(
            {_id: "657227d8fd2109cc5cd75df7"}, 
            {
                gameInProgress: true,
                cat,
                correct,
                answers,
                quest,
                diff,
                x,
                state: '/'
            }
        );
    }

    // emits signal to lobby.ejs that start has been initiated
    ioSocket.emit('start')

    // start queryParam used in app.js middleware to detect the start of the quiz
    res.redirect('/quiz')
}


module.exports.quiz = async (req, res) => {

    const quizDB = await Quiz.findOne({_id: "657227d8fd2109cc5cd75df7"})

    const quiz = JSON.stringify(quizDB)


    res.render('quiz/quiz', {quiz, title: 'Easy if you know it!', page: 'quiz'})
}


module.exports.finishPost = async (req, res) => {

    const { userFin, ansFin } = req.body
    const ansFinJ = JSON.parse(ansFin)

    // Adds users answers to db
    await User.findOneAndUpdate({userName: userFin}, {answers: ansFinJ})

    ioSocket.emit('userFinished', {userName: userFin, answers: ansFinJ})


    res.redirect('/finish')
}


module.exports.finish = async (req, res) => {

    const users = await User.find()

    let userResults = []

    users.forEach(u => {
        if(u.answers.length !== 0){
            let user = {userName: u.userName, answers: u.answers}
            userResults.push(user)
        }
    })
    
    let userResultsStr = JSON.stringify(userResults)


    res.render('quiz/finish', {userResultsStr, title: 'How did you do?', page: 'finish'})
}



module.exports.resetPost = async (req, res) => {

    // Route resets the quiz, removing all users and setting quiz back to default.

    await mongoose.connection.db.dropCollection('users')

    await Quiz.findOneAndUpdate(
        {_id: "657227d8fd2109cc5cd75df7"}, 
        {   
            gameInProgress: false,
            cat: [],
            correct: [],
            answers: [],
            quest: [],
            diff: [],
            x: 0,
            state: '/'
        }
    )
    
    // Emits the reset signal picked up in boilerplater.ejs
    // Sends the user back to '/' after the above code has run to reset the quiz
    ioSocket.emit('reset')

    // Clears the userSubmittedList in app.js
    ioSocket.emit('clearSubmitted')

    
    // Redirects with queryParam to send everybody back to /
    res.redirect('/')
}

