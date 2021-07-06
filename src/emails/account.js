const nodemailer=require("nodemailer")

let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: 'nithima2001@gmail.com',
        pass: 'priya@1312'
    }
});

const sendWelcomeEmail = (email,name)=>{
    mailTransporter.sendMail({
        from: 'nithima2001@gmail.com',
        to: email,
        subject: "Thanks for joining in!",
        text: `Welcome to the Task Managing App, ${name}. Let me know how you get along with the app.`
    }).then(()=>{
        console.log("Email send successfully!")
    }).catch((err)=>{
        console.log(err)
    })
}

const sendCancelationEmail = (email,name)=>{
    mailTransporter.sendMail({
        from: 'nithima2001@gmail.com',
        to: email,
        subject: 'Sorry to see you go!',
        text: `Goodbye, ${name}. I hope to see you back sometime soon.` 
    }).then(()=>{
        console.log("Email send successfully!")
    }).catch((err)=>{
        console.log(err)
    })
}

module.exports ={
    sendWelcomeEmail,
    sendCancelationEmail
}