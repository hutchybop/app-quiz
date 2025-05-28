const nodemailer = require('nodemailer');


module.exports.mail = async(subject, text, to) => {

        const emailUser = process.env.EMAIL_USER
        const aliasEmail = process.env.EMAIL_ADDRESS

        const smtpTransport = nodemailer.createTransport({
            host: 'smtp.zoho.eu',
            port: 465,
            secure: true,
            auth: {
                user: emailUser,
                pass: process.env.ZOHOPW
            }
        });

        const mailOptions = {
            to: to || process.env.EMAIL_ADDRESS,
            from: aliasEmail,
            subject: subject,
            text: text
        };

        await smtpTransport.sendMail(mailOptions, (err) => {
            if(err){
                console.log(err)
            }
        });
    
    }