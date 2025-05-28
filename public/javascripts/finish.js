checkUser = localStorage.getItem('userName')
const userResultsDiv = document.querySelector('#userResultsDiv')

const funny = (percent) => {
    let funnyComment = ''
    if(percent === 0){
        funnyComment = "That's embarrassing, hopefully nobody saw..."
    }else if(percent > 1 && percent < 11){
        funnyComment = "Nap time was it..?"
    }else if(percent > 11 && percent < 21){
        funnyComment = "Let's call it a technical issue."
    }else if(percent > 21 && percent < 31){
        funnyComment = "If you had a pound for every smart thing you read, you'd be poor."
    }else if(percent > 31 && percent < 41){
        funnyComment = "It's called a book, read one..."
    }else if(percent > 41 && percent < 51){
        funnyComment = "Are you drinking too much, because that was below par..."
    }else if(percent > 51 && percent < 61){
        funnyComment = "Respectable just..."
    }else if(percent > 61 && percent < 71){
        funnyComment = "Boringly average."
    }else if(percent > 71 && percent < 81){
        funnyComment = "Well someone can read... Google"
    }else if(percent > 81 && percent < 91){
        funnyComment = "Unless your name is Google, stop getting answers correct."
    }else if(percent > 91 && percent < 99){
        funnyComment = "Nobody likes a show off..."
    }else if(percent === 100){
        funnyComment = "It's called alcohol, drink it..."
    }
    return funnyComment
}

const divFill = (el) => {

    const correct = el.answers.filter((x) => x === 'O').length
    const inCorrect = el.answers.filter((x) => x === 'X').length
    const percentRaw = (correct / el.answers.length) * 100
    const percent = Math.round(percentRaw* 100) / 100
    let userComment = funny(percent)

    const col = document.createElement("div")
    col.classList.add("col-lg-4")

    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card", "mt-3", "mb-3")
    cardDiv.style.width = "18rem"
    col.appendChild(cardDiv)

    const cardHeaderDiv = document.createElement("div")
    cardHeaderDiv.classList.add("card-header")
    cardDiv.appendChild(cardHeaderDiv)

    const h2 = document.createElement("h2")
    h2.innerText = el.userName
    cardHeaderDiv.appendChild(h2)

    const ul = document.createElement("ul")
    ul.classList.add("list-group", "list-group-flush")
    cardDiv.appendChild(ul)

    const addCorrect = document.createElement("li");
    addCorrect.innerText = 'Correct Answers: '
    addCorrect.classList.add("list-group-item")
    const addCorrectSpan = document.createElement("span")
    addCorrectSpan.classList.add("highlight")
    addCorrectSpan.innerText = correct
    addCorrect.appendChild(addCorrectSpan)
    ul.appendChild(addCorrect)

    const addIncorrect = document.createElement("li");
    addIncorrect.innerText = 'Incorrect Answers: '
    addIncorrect.classList.add("list-group-item")
    const addIncorrectSpan = document.createElement("span")
    addIncorrectSpan.classList.add("highlight")
    addIncorrectSpan.innerText = inCorrect
    addIncorrect.appendChild(addIncorrectSpan)
    ul.appendChild(addIncorrect)

    const addPercent = document.createElement("li");
    addPercent.classList.add("list-group-item")
    const addPercentSpan = document.createElement("span")
    addPercentSpan.classList.add("highlight")
    addPercentSpan.innerText = percent + '% - '
    addPercent.appendChild(addPercentSpan)
    const addPercentSpanTwo = document.createElement("span")
    addPercentSpanTwo.innerText = "'" + userComment + "'"
    addPercent.appendChild(addPercentSpanTwo)
    ul.appendChild(addPercent)


    return col

}


const addUsersResults = () => {

    userResultsObj.forEach((u) => {
        if(u.userName === checkUser){
            userResultsDiv.prepend(divFill(u))
        }else{
            userResultsDiv.appendChild(divFill(u))
        }
    })

}


addUsersResults()

socket.on('userFinished', (newUserResults) => {

    userResultsObj.push(newUserResults)
    userResultsDiv.innerHTML = " "
    addUsersResults()

})


// if(checkUser !== null && checkUser.toLowerCase() === 'hutchybop'){
//     socket.emit('finish')
// }