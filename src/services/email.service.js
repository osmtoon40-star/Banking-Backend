const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service : 'gmail',
    user : process.env.EMAIL_USER,
    clientId : process.env.CLIENT_ID,
    clientService :process.env.CLIENT_SECRET,
    refreshToken : process.env.REFRESH_TOKEN,
})

transporter.verify((error, success) => {
    if(error){
        console.error('Error connecting to email server:', error);
    }else{
        console.log('Email Server is ready to send email');
    }
});

// Function to send email

const sendEmail = async (to,subject,text,html) => {
    try {
        const info = await transporter.sendMail({
            from : `"Banking Backend" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });
        console.log('Email sent:  %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email: ', error);
    }
}

async function sendRegistrationEmail(userEmail , name) {
    const subject = 'Welcome to Banking Backend';
    const text = `Hello ${name},\n\nThank you for registering with our banking backend. We are excited to have you on board! If you have any questions or need assistance, feel free to reach out to our support team.\n\nBest regards,\nBanking Backend Team`;
    const html = `<p>Hello ${name},</p><p>Thank you for registering with our banking backend. We are excited to have you on board! If you have any questions or need assistance, feel free to reach out to our support team.</p><p>Best regards,<br>Banking Backend Team</p>`;
    
    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccountId) {
    const subject = 'Transaction Completed';
    const text = `Hello ${name},\n\nYour transaction of ₹${amount} to account ${toAccountId} has been completed successfully.\n\nBest regards,\nBanking Backend Team`;
    const html = `<p>Hello ${name},</p><p>Your transaction of ₹${amount} to account ${toAccountId} has been completed successfully.</p><p>Best regards,<br>Banking Backend Team</p>`;
    
    await sendEmail(userEmail, subject, text, html);
}

module.exports = { sendEmail, sendRegistrationEmail, sendTransactionEmail };