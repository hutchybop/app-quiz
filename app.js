//////////////////////// Notes//////////////////////////////
// Run 'runQuiz.sh' from serverScripts folder
// This will upload and run the app on longrunner server
// Go to quiz.longrunner.co.uk
// username for 'quizmaster is hutchybop
// Need to add userName hutchybop to local storage


if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// Required installed packages
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const mongoSanitize = require('express-mongo-sanitize')
const http = require('http');


// Required personal packages
const ExpressError = require('./utils/ExpressError');
const { errorHandler } = require('./utils/errorHandler');
const { Quiz } = require('./models/quiz')
const { User } = require('./models/user')

// Required imports
const quiz = require('./controllers/quiz');

// Setting up express
const app = express();

// Setting up the server with io
const server = http.createServer(app);
// const io = require('socket.io')(server, {
//     connectionStateRecovery: {}
// });
const io = require('socket.io')(server);

global.ioSocket = io


// setting up mongoose
const dbName = "quiz"
// const dbUrl = "mongodb://127.0.0.1:27017/" + dbName; // For local db
const dbUrl = "mongodb+srv://hutch:" + process.env.MONGODB + "@hutchybop.kpiymrr.mongodb.net/" + dbName + "?retryWrites=true&w=majority&appName=hutchyBop" // For Atlas (Cloud db)
mongoose.connect(dbUrl);

// Error Handling for the db connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// Required to run eje files
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
// Allows us to add HTTP verbs other than post
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '/public')))
// Helps to stop mongo injection by not allowing certain characters in the query string
app.use(mongoSanitize())


// Add any middleware to run before every request here
app.use(async(req, res, next) => {

    next();
});

app.get('/', quiz.index)
app.post('/lobby', quiz.lobbyPost)
app.get('/lobby', quiz.lobby)
app.post('/start', quiz.startPost)
app.get('/quiz', quiz.quiz)
app.post('/reset', quiz.resetPost)
app.post('/finish', quiz.finishPost)
app.get('/finish', quiz.finish)

let userSubmittedList = []
let usersFinishedList = []

// Recieves signal from quiz.ejs that next question has been clicked
// Needs to be after routes in app.js or will cause a loop and data leaks
io.on('connection', async (socket) => {

    socket.on('nextQuest', async (arg) => {
        io.emit('nextQuestU', arg)
        await Quiz.findOneAndUpdate( {_id: "657227d8fd2109cc5cd75df7"}, { x: arg } )
    })

    // Adds the user to the userSubmittedList and sens it back to quiz script
    socket.on('submitted', (checkUser) => {
        userSubmittedList.push(checkUser)
        io.emit('userSubmittedList', userSubmittedList)
    })

    // Clears the userSubmittedList for the next question
    socket.on('clearSubmitted', () => {
        userSubmittedList = []
    })

    let finArray = []
    await socket.on('userFinished', async (userResults) => {
        // console.log('here ' + userResults)

        if(usersFinishedList.length !== 0){
            usersFinishedList.forEach(el => {
                finArray.push(Object.keys(el)[0])
            })
            console.log(Object.keys(userResults)[0])
            // console.log(finArray)
            if(!finArray.includes(Object.keys(userResults)[0])){
                usersFinishedList.push(userResults)
            }
        }else{
            usersFinishedList.push(userResults)
        }

        // console.log(usersFinishedList)
        
        const userDb = await User.find()
        console.log(usersFinishedList.length)
        console.log(userDb.length)
        // console.log(userDb)
        console.log(usersFinishedList)
        if(usersFinishedList.length === userDb.length){
            io.emit('allUsersFinished', usersFinishedList)
        }
    })


    socket.on('lobby', async () => {
        await Quiz.findOneAndUpdate( {_id: "657227d8fd2109cc5cd75df7"}, { state: "/lobby" } )
    })
    socket.on('quiz', async () => {
        await Quiz.findOneAndUpdate( {_id: "657227d8fd2109cc5cd75df7"}, { state: "/quiz" } )
    })
    socket.on('finish', async () => {
        await Quiz.findOneAndUpdate( {_id: "657227d8fd2109cc5cd75df7"}, { state: "/finish" } )
    })

})


// Unknown (404) webpage error
// Uses the ExpressError to pass message (Page Not Found) and statusCode (404)
// to the error handler
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

// Error Handler, from utils.
app.use(errorHandler)


let port = 3000;
server.listen(port, () => console.log('Server listening on PORT ' + port ));

