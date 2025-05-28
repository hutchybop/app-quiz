const { lobbyNewSchema, lobbyJoinSchema, userDataSchema, tandcSchema } = require('../models/schemas')

// Function to send a Flash error instead of re-directing to error page
const JoiFlashError = (error, req, res, next, url) => {
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        // Allows for generic message in production
        if (process.env.NODE_ENV !== "production") { 
            req.flash('error', `${msg}`);
        }else if(msg.includes('must not include HTML!')){
            req.flash('error', 'No HTML allowed, this includes, &, <, > ...');
        }else{
            req.flash('error', 'There has been a validation error, please try again.');
        }
        // throw new ExpressError(msg, 400) // ExpressError will send the user to the error page
        return res.redirect(`${url}`);
    } else {
        return next()
    }
}


///////// All ...Schama are coming from schemas.js file
//////// JoiFlashError is defined above


module.exports.validateLobbyNew = (req, res, next) => {
    const { error } = lobbyNewSchema.validate(req.body)
    JoiFlashError(error, req, res, next, '/')
}


module.exports.validateLobbyJoin = (req, res, next) => {
    const { error } = lobbyJoinSchema.validate(req.body)
    JoiFlashError(error, req, res, next, '/')
}


module.exports.validateUserData = (req, res, next) => {
    const userData = res.locals.userData;
    // Sends the user back to the previous url or '/' if 'Referer' is not available
    const previousUrl = req.headers.referer || '/'; 

    if(!userData){
        return next();
    }

    const { error } = userDataSchema.validate(userData)
    JoiFlashError(error, req, res, next, previousUrl) // need to work for all routes
}


module.exports.validateTandC = (req, res, next) => {
    const { error } = tandcSchema.validate(req.body)
    JoiFlashError(error, req, res, next, '/info')
}