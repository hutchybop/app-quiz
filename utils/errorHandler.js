//Error handler
module.exports.errorHandler = (err, req, res, next) => {

    const { statusCode = 500 } = err;

    // Generic error
    if (!err.message) err.message = 'Oh No, something went wrong.'

    console.log(err.statusCode)
    // res.status(statusCode).json(err.message)
    res.status(statusCode).render('error', { err, title: 'Error - Something Went Wrong'})
};