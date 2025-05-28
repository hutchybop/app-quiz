const checkUser = localStorage.getItem('userName')
const cat = document.querySelector('#cat')
const diff = document.querySelector('#diff')
const question = document.querySelector('#question')
const questNum = document.querySelector('#questNum')
const multiOne = document.querySelector('#multiOne')
const multiTwo = document.querySelector('#multiTwo')
const multiThree = document.querySelector('#multiThree')
const multiFour = document.querySelector('#multiFour')
const next = document.querySelector('#next')
const checkboxes = document.querySelectorAll("input[type='checkbox']")
const submitBtn = document.querySelector('#submitBtn')
const correctAns = document.querySelector('#correctAns')
const finishForm = document.querySelector('#finishForm')
const userFin = document.querySelector('#userFin')
const ansFin = document.querySelector('#ansFin')
const submittedDiv = document.querySelector('#submittedDiv')
const submittedUl = document.querySelector('#submittedUl')

// Controls the question number (starts at 0 due to indexing)
let x = quiz.x
let submitBtnState = null
let checkedNum = null
let userSubmittedArray = []

const userRefresh = () => {
    localStorage.removeItem('disconnected')
    checkboxes.forEach(el => {
        if(el.checked === true){
            checkedNum = el.id
        }
    })
    localStorage.setItem('disconnected', JSON.stringify([submitBtn.style.display, checkedNum, userSubmittedArray]))
}

// Allows beforeunload to work on multiple browsers including iphone/ipad
let unloaded = false;
window.addEventListener("beforeunload", function(e)
{
    if (unloaded)
        return;
    unloaded = true;
    userRefresh()
});
window.addEventListener("visibilitychange", function(e)
{
    if (document.visibilityState == 'hidden')
    {
        if (unloaded)
            return;
        unloaded = true;
        userRefresh()
    }
});

let dis =  JSON.parse(localStorage.getItem('disconnected'))
if(dis){
    submitBtnState = dis[0]
    checkedNum = dis[1]
    userSubmittedArray = dis[2]
}


finishForm.style.display = "none"

// Sets up the question
const quest = (x) => {

    // Setting up the answers in alphabetical order
    let answersArray = []
    for(a of quiz.answers[x]){
        answersArray.push(a)
    }
    answersArray.push(quiz.correct[x])
    answersArray.sort()

    // Adding question details to DOM
    cat.innerText = quiz.cat[x]
    diff.innerText = quiz.diff[x]
    question.innerText = quiz.quest[x]
    questNum.innerText = x + 1
    multiOne.innerText = answersArray[0]
    multiTwo.innerText = answersArray[1]
    multiThree.innerText = answersArray[2]
    multiFour.innerText = answersArray[3]
}


// nextQuest function, need to be first to run it below
const nextQuest = (x, emit) => {

    // emit should be: socket.emit('nextQuest', x)
    // Only to be used by hutchyBop
    // emits an io signal that next has been clicked
    // Should update all user broswers with next question/show answer
    emit
  

    if(x !== quiz.answers.length){

        if(x%2 === 1 || x%2 === 0){ // If x is a full number, next question
            // Reshows the submit button, unless user has disconnected, then shows last known state
            if(submitBtnState !== null){
                submitBtn.style.display = submitBtnState
                if(submitBtnState === 'none'){
                    checkboxes.forEach(el => el.disabled = true)
                }else{
                    checkboxes.forEach(el => el.disabled = false)
                }
            }else{
                submitBtn.style.display = ""
                checkboxes.forEach(el => el.disabled = false)

            }
            // Changes next button's text
            next.innerText = 'Show Answer'
            // Resets the checkboxes and correct answer for the next question
            if(checkedNum !== null){
                checkboxes.forEach(el => {
                    if(el.id === checkedNum){
                        el.checked = true
                    }else{
                        el.checked = false
                    }
                    el.parentNode.style.display = ""
                })
            }else{
                checkboxes.forEach(el => {
                    el.checked = false
                    el.parentNode.style.display = ""
                })
            }

            // Hides the correct answer
            correctAns.innerText = ""

            // Shows the question
            quest(x)
    
        }else{ // If x ends in .5, show answer

            // Shows the question, incase the user disconnected
            // Need to -0.5 to show the last question
            quest(x-0.5)

            submitBtn.style.display = "none"

            // Removes all un-checked answers from display
            if(checkedNum !== null){
                checkboxes.forEach(el => {
                    if(el.id === checkedNum){
                        el.checked = true
                        el.parentNode.style.display = ""
                        el.disabled = true
                    }else{
                        el.parentNode.style.display = "none"
                    }
                })
            }else{
                checkboxes.forEach(el => {
                    if(el.checked === false){
                        el.parentNode.style.display = "none"
                    }else{
                        el.parentNode.style.display = ""
                    }
                })
            }

            // Shows the correct answer to the user
            const correct = quiz.correct[x-0.5]
            correctAns.innerText = 'The correct answer was: ' + correct

            // Changes the next button text
            next.innerText = 'Next Question'
        }

        // Reseting disconnected localStorage if present
        let discon = localStorage.getItem('disconnected')
        if(discon){
            localStorage.removeItem('disconnected')
            submitBtnState = null
            checkedNum = null
        }

    }else{
        alert('End of Quiz!')
        const userNameFin = localStorage.getItem('userName')
        const userAnsFin = localStorage.getItem('userAns')
        userFin.value = userNameFin
        ansFin.value = userAnsFin
        document.forms["finishForm"].submit();
    }
}

// Loads first question straight away
nextQuest(x)


// Hides the next button to everyone apart from the 'hutchybop' userName
if(checkUser === null || checkUser.toLowerCase() !== 'hutchybop'){
    next.style.display = "none";
}


// ALlows only one checkbox to be checked at once.
for(let i = 0; i < checkboxes.length; i++){
    checkboxes[i].addEventListener("change", (event) => {
        if(event.target.checked === true){
            checkboxes.forEach(el => el.checked = false)
            checkboxes[i].checked = true
        }
    });
}


// Submits the user answer to the localStorage and shows the correct answer
submitBtn.addEventListener('click', (event) => {

    // Stops the page refreshing when button clicked
    event.preventDefault();
    event.stopPropagation();

    // Gets the correct answer for the question
    const correct = quiz.correct[x]

    // Stops users not submitting an answer
    const selection = document.querySelectorAll('input[type="checkbox"]:checked').length
    if(selection !== 1){
        return alert('No answer selected...')
    }

    // Adds a 'O' for correct or 'X' for incorrect to userAns array and stores in localStorage
    for(let i = 0; i < checkboxes.length; i++){
        if(checkboxes[i].checked === true){
            // Checking if the answer is correct
            const ans = checkboxes[i].nextElementSibling.innerText.substring(3)
            // Adds a 'O' if correct or 'X' if incorrect to userAns array 
            // and stores it in the users localStorage 
            if(correct.trim() === ans.trim()){
                const userAns = localStorage.getItem('userAns')
                if(userAns){
                    let userAnsParse = JSON.parse(userAns)
                    userAnsParse.push('O')
                    localStorage.setItem('userAns', JSON.stringify(userAnsParse))
                }else{
                    localStorage.setItem('userAns', JSON.stringify(['O']))
                }
            }else{
                const userAns = localStorage.getItem('userAns')
                if(userAns){
                    let userAnsParse = JSON.parse(userAns)
                    userAnsParse.push('X')
                    localStorage.setItem('userAns', JSON.stringify(userAnsParse))
                }else{
                    localStorage.setItem('userAns', JSON.stringify(['X']))
                }
            }
        }
    }

    // Hides the submit button and disables all checkboxes to stop users continually getting correct scores
    submitBtn.style.display = 'none'
    checkboxes.forEach(el => el.disabled = true)

    // Sends a signal to app.js that a user has submitted their answer
    socket.emit('submitted', checkUser)

})

socket.on('userSubmittedList', (userSubmittedList) => {
    userSubmittedArray = userSubmittedList
    viewSubmitted(userSubmittedArray)
})

const viewSubmitted = (userArray) => {
    submittedUl.innerHTML = ""
    userArray.forEach(el => {
        const addUser = document.createElement("li");
        addUser.innerText = el
        addUser.classList.add("list-group-item")
        submittedUl.appendChild(addUser)
    })
    if(checkUser === null || checkUser.toLowerCase() !== 'hutchybop'){
        submittedDiv.style.display = "none"
    }
}

viewSubmitted(userSubmittedArray)


// hutchybop clicks for the next question
next.addEventListener('click', () => {

    // Sends a signal to app.js to clear the userSubmittedList
    socket.emit('clearSubmitted')
    // Clears the local userSubmittedArray
    userSubmittedArray = []
    // Resets the submittedUl on quiz.ejs
    submittedUl.innerHTML = ""

    // Runs the nextQuest function
    // Resets the checkboxes and correct answer 
    // Then loads the next question
    // x needs to be updated here for hutchybop
    x += 0.5

    // Sends an io signal to app.js with x (the question number)
    // which updates the db and sends it back here for all other users to run nextQuest function
    const emit = socket.emit('nextQuest', x)

    nextQuest(x, emit)

})

// Once the io signal is recieved all users apart from hutchybop will run nextquest function
// arg is x (question number sent above)
if(checkUser !== null && checkUser.toLowerCase() !== 'hutchybop'){
    socket.on('nextQuestU', (arg) => {
        // x is updated here using arg from app.js for all other users
        x = arg
        nextQuest(x)
    })
}

if(checkUser !== null && checkUser.toLowerCase() === 'hutchybop'){
    socket.emit('quiz')
}

