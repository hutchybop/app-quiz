if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


// External imports
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const flash = require('connect-flash');
const favicon = require('serve-favicon')
const compression = require('compression')


// Local imports
const ExpressError = require('./utils/ExpressError');
const { errorHandler } = require('./utils/errorHandler');
const catchAsync = require('./utils/catchAsync');
const quiz = require('./controllers/quiz');
const api = require('./controllers/api');
const policy = require('./controllers/policy');
const quizChecks = require('./utils/quizChecks');
const logger = require('./utils/logger');
const { validateLobbyNew, validateLobbyJoin, validateUserData, validateTandC } = require('./utils/middleware');


// Required for recaptcha
const Recaptcha = require('express-recaptcha').RecaptchaV2
const recaptcha = new Recaptcha(process.env.SITEKEY, process.env.SECRETKEY, {callback: 'cb'})


// Setting up express
const app = express();
const server = http.createServer(app);

// Setting up socket.io
const io = socketIo(server)


// Setting up mongoose
const dbName = "quiz"
let dbUrl
if (process.env.NODE_ENV !== "production") {
    dbUrl = "mongodb://127.0.0.1:27017/" + dbName; // For local db (will not work in production)
}else{
    dbUrl = "mongodb+srv://hutch:" + process.env.MONGODB + "@hutchybop.kpiymrr.mongodb.net/" + dbName + "?retryWrites=true&w=majority&appName=hutchyBop" // For Atlas (Cloud db)
}
mongoose.connect(dbUrl);
// Error Handling for the db connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


// Serve favicon from public/favicon directory
app.use(favicon(path.join(__dirname, 'public', 'favicon', 'favicon.ico')));
// Handle favicon requests explicitly
app.use('/favicon.ico', (req, res) => {
    res.sendStatus(204); // No Content
});


// Setting up the app
app.engine('ejs', ejsMate); // Tells express to use ejsmate for rendering .ejs html files
app.set('view engine', 'ejs'); // Sets ejs as the default engine
app.set('views', path.join(__dirname, 'views')); // Forces express to look at views directory for .ejs files
app.use(express.urlencoded({ extended: true })); // Makes req.body available
app.use(express.json()); // Middleware to parse JSON bodies
app.use(methodOverride('_method')); // Allows us to add HTTP verbs other than post
app.use(express.static(path.join(__dirname, '/public'))) // Serves static files (css, js, imgaes) from public directory
app.use(mongoSanitize()) // Helps to stop mongo injection by not allowing certain characters in the query string


// Logs all routes requested
app.use(logger)


// Setting up helmet to allow certain scripts/stylesheets
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://code.jquery.com/",
    "https://www.google.com/recaptcha/api.js",
    "https://www.gstatic.com/recaptcha/releases/",
    "https://use.fontawesome.com/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://cdnjs.cloudflare.com/",
    "https://fonts.gstatic.com",
    "https://www.gstatic.com/recaptcha/releases/"
];
const imgSrcUrls = [
    "https://www.gstatic.com/recaptcha/",
    "https://www.google.com/recaptcha/"
];
const connectSrcUrls = [
    "https://www.google.com/",
    "https://www.gstatic.com/recaptcha/"
];
const fontSrcUrls = [
    "https://cdnjs.cloudflare.com/",
    "https://fonts.gstatic.com",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/"
];
const frameSrcUrls = [
    'https://www.google.com',
    'https://www.recaptcha.net'
];
// Function to configure helmet based on environment
function configureHelmet() {
    if (process.env.NODE_ENV === 'production') {
        app.use(
            helmet({
                contentSecurityPolicy: {
                    directives: {
                        defaultSrc: ["'self'"],
                        connectSrc: ["'self'", ...connectSrcUrls],
                        scriptSrc: ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
                        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
                        workerSrc: ["'self'", "blob:"],
                        objectSrc: ["'none'"],
                        imgSrc: ["'self'", "blob:", "data:", ...imgSrcUrls],
                        fontSrc: ["'self'", ...fontSrcUrls],
                        frameSrc: ["'self'", ...frameSrcUrls],
                        upgradeInsecureRequests: null,  // Relax or adjust as necessary
                        scriptSrcAttr: ["'self'", "'unsafe-inline'"]  // Adjust based on your needs
                    },
                },
                crossOriginOpenerPolicy: { policy: "same-origin" },
                originAgentCluster: true
            })
        );
    } else {
        app.use(
            helmet({
                contentSecurityPolicy: {
                    directives: {
                        defaultSrc: ["'self'", "*"],
                        connectSrc: ["'self'", "*", ...connectSrcUrls],
                        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "*", ...scriptSrcUrls],
                        styleSrc: ["'self'", "'unsafe-inline'", "*", ...styleSrcUrls],
                        workerSrc: ["'self'", "blob:"],
                        objectSrc: ["'self'", "*"],
                        imgSrc: ["'self'", "blob:", "data:", "*", ...imgSrcUrls],
                        fontSrc: ["'self'", "*", ...fontSrcUrls],
                        frameSrc: ["'self'", "*", ...frameSrcUrls],
                        upgradeInsecureRequests: null,
                        scriptSrcAttr: ["'self'", "'unsafe-inline'", "*"]
                    },
                },
                crossOriginOpenerPolicy: { policy: "unsafe-none" }, // Relaxed for development
                originAgentCluster: false, // Disabled in development
                referrerPolicy: { policy: "no-referrer-when-downgrade" }, // Less strict referrer policy
                frameguard: false, // Disable clickjacking protection in development
                hsts: false, // Disable HTTP Strict Transport Security (HSTS) in development
                noSniff: false // Allow MIME type sniffing in development
            })
        );
    }
}
// Apply helmet configuration
configureHelmet();


//Setting up the session
const sessionConfig = {
    name: 'longrunnerQuiz', // Name for the session cookie
    secret: process.env.SESSION_KEY, // Secures the session
    resave: false, // Do not save session if unmodified
    saveUninitialized: false, // Do not create session until something stored
    proxy: process.env.NODE_ENV === "production", //Allows the use of Nginx on longrunner
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 * 7 * 2, // 14 days
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        SameSite: 'strict', // Protect against CSRF
        secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS
    },
    store: MongoStore.create({ 
        mongoUrl: dbUrl
    })
}
app.use(session(sessionConfig))


// Required after session setup.
app.use(flash());


// Compression to make website run quicker
app.use(compression())

// Add any middleware to run before every request here
app.use(async(req, res, next) => {

    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.userData = req.session.userData || null // Sets userData for all routes
    next()

    // // Good for debugging
    // if(res.locals.userData){
    //     console.log(res.locals.userData.userName + ' ' + req.path)
    // }else{
    //     console.log(req.path)
    // }
});


// Validate userData if present
app.use(validateUserData);
// Make sure the user is in the correct place
// app.use(catchAsync(quizChecks))
app.use(quizChecks)


// Pass `io` instance to routes
app.use((req, res, next) => {
    req.io = io;
    next();
});


// Ajax-api routes
app.get('/api/quizcode', api.quizCode)
app.post('/api/start-quiz', catchAsync(api.startQuiz))
app.post('/api/submit-quiz', catchAsync(api.submitQuiz))
app.get('/api/show-quiz', api.showQuiz)
app.get('/api/next-quiz', catchAsync(api.nextQuiz))
app.get('/api/finished-quiz', catchAsync(api.finishedQuiz))
app.get('/api/logs', catchAsync(api.logs))


// Quiz routes
app.get('/', quiz.index)
app.post('/lobby-new', validateLobbyNew, catchAsync(quiz.lobbyNewPost))
app.post('/lobby-join', validateLobbyJoin, catchAsync(quiz.lobbyJoinPost))
app.get('/lobby', catchAsync(quiz.lobby))
app.get('/quiz', catchAsync(quiz.quiz))
app.get('/finish', catchAsync(quiz.finish))
app.patch("/quiz-kick-user", catchAsync(quiz.quizKickUserPatch))
app.patch('/reset-user', catchAsync(quiz.resetUserPatch))
app.delete('/reset-quiz', catchAsync(quiz.resetQuizDelete))


// Policy Routes
app.get('/cookie-policy', policy.cookiePolicy)
app.get('/tandc', recaptcha.middleware.render, policy.tandc)
app.post('/tandc', recaptcha.middleware.verify, validateTandC, policy.tandcPost)


// Unknown (404) webpage error
// Uses the ExpressError to pass message (Page Not Found) and statusCode (404) to the error handler
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})


// Error Handler, from utils.
app.use(errorHandler)


let port = 3002; // This is the port setup with nginx on longrunner server
server.listen(port, () => console.log('Server listening on PORT', port ));


// Simplified io.socket setup
io.on('connection', (socket) => {
    // No need to log connections and disconnections if not required

    // const clientId = socket.id;
    // console.log(`User connected: ${clientId}`);

    // // Listen for disconnection
    // socket.on('disconnect', () => {
    //     console.log(`User disconnected: ${clientId}`);
    // });
    
});