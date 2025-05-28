const { mail } = require('../utils/mail')


// GET - cookie-policy
module.exports.cookiePolicy = (req, res) => {

    res.render('policy/cookiePolicy', {title: 'cookiePolicy', page: 'cookiePolicy'})

}


// GET - tandc
module.exports.tandc = (req, res) => {

    res.render('policy/TandCs', {captcha: res.recaptcha, title: 'TandCs', page: 'TandCs'})

}


// POST - Info
module.exports.tandcPost = (req, res) => {

    if (!req.recaptcha.error) {

        mail(
            'Contact Form Submitted - quiz.longrunner.co.uk',
            'Hello,\n\n' +
                'Your message to quiz.longrunner.co.uk has been submittted. The details are below' + '\n\n' + 
                `Name: ${req.body.name}` + '\n\n' +
                `Email: ${req.body.email}` + '\n\n' +
                `Message: ${req.body.message}`,
            req.body.email
        )
    
        mail(
            'Contact Form Submitted - quiz.longrunner.co.uk',
            'Hello,\n\n' +
                'A new message has been submitted' + '\n\n' + 
                `Name: ${req.body.name}` + '\n\n' +
                `Email: ${req.body.email}` + '\n\n' +
                `Body: ${req.body.message}`
        )

        req.flash('success', 'Message sent.');
        res.redirect('/tandc')

    } else {
        req.flash('error', 'recaptcha failed, please try again');
        res.redirect('/tandc')
    }

}