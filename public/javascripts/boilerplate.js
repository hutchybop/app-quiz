// Setup io.socket
const socket = io();

//  listens for reconnects, then reloads the window on reconnect
socket.on('reconnect', (attemptNumber) => {
    console.log('Reconnected to the io.socket server after', attemptNumber, 'attempt(s)');
    // Reload the page on reconnect
    window.location.reload();
});


// ResetQuiz emitted from quiz controller reset-quiz route
socket.on('resetQuiz', (quizCode) => {
  if(res.locals.userData && res.locals.userData.quizCode !== quizCode){
    let userQuizCode = ''
    // Sends an AJAX request to the server to retrieve the user;s current quizCode.
    fetch('/api/quizcode',{
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    .then(response => response.json())
    .then(data => {
      // If the user's quizCode (data.message) is the same as 
      // The quizCode from the reset io.socket (sent from /reset-quiz)
      // It reloads the window and redirects the user to / where userData is wiped
      // This happens either at / or quizChecks middleware
      userQuizCode = data.message
      if(userQuizCode == quizCode){
        window.location.replace("/?isResetQuiz=true");
      }
    })
    .catch(error => console.error('Error fetching user data:', error));
  }
})


// Cookie alert - for first time visits
// User has to clear the alert for it not to show on every page
const cookieAlert = document.getElementById('cookieAlert');
const cookieAlertBtn = document.getElementById('cookieAlertBtn');
cookieAlertBtn.addEventListener('click', () => {
  localStorage.setItem('hasVisited', 'true');
});
let cookieAlertCheck =localStorage.getItem('hasVisited');
if (!cookieAlertCheck) {
    cookieAlert.style.display = 'block';
  } else {
    cookieAlert.style.display = 'none';
  }