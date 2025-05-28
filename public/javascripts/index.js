const checkUser = localStorage.getItem('userName')
const lobbyBtn = document.querySelector('#lobbyBtn')
const inProgress = document.querySelector('#inProgress')
const dupe = document.querySelector('#dupe')

// Enables the 'start' button and hides the inProgress text only for userName 'hutchybop' 
// unless the quiz is not inProgress, then enables and hides for everyone
if(checkUser !== null && checkUser.toLowerCase() === 'hutchybop' || gameInProgress === false){
    lobbyBtn.removeAttribute('disabled')
    inProgress.style.display = 'none'
}

// userListArray.forEach(el => {
//     if(checkUser !== null && checkUser === el){
//         window.location.replace(userGameState);
//     }
// });


// If a duplicate name has been chosen, the dupe flash warning will be shown to the user
if(userDupe === false){
    dupe.style.display = "none"
}

// Get the start signal from app.js and reloads the page.
// As the quiz is started the inPrgoress will change to true and the user will be locked out
socket.on('start', () => {
    lobbyBtn.removeAttribute('disabled')
    inProgress.style.display = 'none'
})

// Once the user enters, thier localStorage is cleared and the new userName added.
lobbyBtn.addEventListener('click', () => {
    localStorage.clear()
    localStorage.setItem("userName", userName.value);
})