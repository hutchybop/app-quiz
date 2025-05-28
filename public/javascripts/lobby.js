const checkUser = localStorage.getItem('userName')
const start = document.querySelector("#start")
const userList = document.querySelector("#userList")

// Hides the start button to everyone apart from the 'hutchybop' userName
if(checkUser === null || checkUser.toLowerCase() !== 'hutchybop'){
    start.style.display = "none";
}

// Receives a signal from app.js middleware if a newUser is added to the quiz
// Then reloads the page and shows the newUser
socket.on('newUser', (userName) => {
    const addUser = document.createElement("li");
    addUser.classList.add("list-group-item")
    addUser.innerText = userName
    userList.appendChild(addUser)
});

// Receives a signal from app.js middleware if a start is detected
// Then sends the users to /quiz to start the quiz
socket.on('start', () => {
    window.location.replace("/quiz");
})

if(checkUser !== null && checkUser.toLowerCase() === 'hutchybop'){
    socket.emit('lobby')
}