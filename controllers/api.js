const { Quiz } = require('../models/quiz');

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

