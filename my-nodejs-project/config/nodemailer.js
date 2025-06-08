import nodemailer from 'nodemailer';

// Configure the transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // e.g., 'gmail', 'yahoo', or use 'host', 'port', 'secure' for custom SMTP
    auth: {
        user: 'rahuljajoria2412@gmail.com', // replace with your email
        pass: 'sbkcbtfpenyitzku' // replace with your email password or app password
    }
});


export const sendMail = async (to,subject,text) => {
    const options = {
        from: 'rahuljajoria2412@gmail.com', // sender address
        to: to,
        subject:subject,
        text: text,
        html: '<h1>This is a test email</h1><p>Sent using <b>Nodemailer</b> with HTML content.</p>',
        attachments:[
            {
                filename: "myimages.png",
                path: "images/pngtree-email-mascot-sign-shape-series-png-image_4592028.png"
            }
        ]
    };
    try{
    await transporter.sendMail(options);
    }catch(err){
        console.log("error in sending mail: "+err);
    }
};
