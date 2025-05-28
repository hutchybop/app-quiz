const { Quiz } = require('../models/quiz');
const { Log } = require('../models/Log');
const crypto = require('crypto');

// GET - /api/quizCode
module.exports.quizCode = (req, res) => {

    let quizCode = res.locals.userData.quizCode
    res.json({ message: `${quizCode}` });
    
}


// POST - /api/start-quiz
module.exports.startQuiz = async (req, res) => {

    const userData = req.body
    const setProgress = '/quiz'
    const setQuestionNumber = 1
    const setQuizProgress = 'answering'

    if(userData.quizMaster === true){

        await Quiz.findOneAndUpdate({quizCode: userData.quizCode}, 
            {
                progress: setProgress,
                questionNumber: setQuestionNumber
            })
    }
        
    req.session.userData.progress = setProgress
    req.session.userData.quizProgress = setQuizProgress
    req.session.userData.questionNumber = setQuestionNumber

    res.json({message: 'success'})

}


// POST - /api/submit-quiz
module.exports.submitQuiz = async (req, res) => {

    const { score, answer } = req.body
    const userData = res.locals.userData

    // Add score to user and add userName to usersSubmitted
    await Quiz.findOneAndUpdate(
        { quizCode: userData.quizCode, 'users.userName': userData.userName },
        { $inc: { 'users.$.score': score }, $push: {usersSubmitted: userData.userName} }
    );

    // Set quizProgress to answered
    // and adding user answer to answers
    // Required if the user disconnects
    req.session.userData.quizProgress = 'answered'
    req.session.userData.answers.push(answer)

    // Emit submit signal to quiz.ejs
    req.io.emit('submit', userData.userName)

    res.json({message: 'success'})

}

// GET - /api/show-quiz
module.exports.showQuiz = (req, res) => {

    req.session.userData.quizProgress = 'waiting'
    const quizMaster = res.locals.userData.quizMaster

    if(quizMaster === true){
        req.io.emit('show')
    }

    res.json({message: 'success'})

}

// GET - /api/next-quiz
module.exports.nextQuiz = async (req, res) => {

    const userData = res.locals.userData

    if(userData.quizMaster === true){

        quiz = await Quiz.findOneAndUpdate(
            {quizCode: userData.quizCode}, 
            {$inc: {questionNumber: 1}, $set: {usersSubmitted: []}}
        )

        req.io.emit('next')

    }

    req.session.userData.quizProgress = 'answering'
    req.session.userData.questionNumber += 1

    res.json({message: 'success'})

}


// GET - /api/finished-quiz
module.exports.finishedQuiz = async (req, res) => {

    const userData = res.locals.userData
    const quizMaster = userData.quizMaster 

    if(quizMaster === true){    

        const quiz = await Quiz.findOneAndUpdate(
            {quizCode: userData.quizCode}, 
            {$set: {usersSubmitted: []}, $set: {progress: '/finish'}}
        )
    
    }

    req.session.userData.progress = '/finish'
    req.session.userData.quizProgress = 'na'

    res.json({message: 'success'})

}


// GET - /api/logs
module.exports.logs = async(req, res) => {

    const apiKeyHash = req.query.key;

    if (!apiKeyHash) {
        
        // Function to generate the API key hash for the user
        // function generateApiKeyHash(apiKey, secret) {
        //     return crypto.createHmac('sha256', secret)
        //                 .update(apiKey)
        //                 .digest('hex');
        // }
        // const apiKey = 'your-api-key-here'; // The actual API key
        // const secret = 'your-api-key-secret'; // The same secret used by the server
        // // Generate the hash
        // const apiKeyHash = generateApiKeyHash(apiKey, secret);
        // Show the hash
        // return res.json({key: apiKeyHash})

        req.flash('error', 'Sorry you cannot do that')
        return res.redirect('/')
    }

    const apiKey = process.env.APIKEY; // The single API key stored securely
    const secret = process.env.APISECRET; // A secret key stored securely

    // Generate the hash for the valid API key
    const hash = crypto.createHmac('sha256', secret)
                       .update(apiKey)
                       .digest('hex');

    // If API key is valid, proceed with the request
    if (hash !== apiKeyHash) {
        req.flash('error', 'Sorry you cannot do that')
        return res.redirect('/')
    }

    // Fetch all Log documents
    const logs = await Log.find().lean().exec();

    // Send the logs as readable JSON
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(logs, null, 2)); // 4 spaces for indentation

}

