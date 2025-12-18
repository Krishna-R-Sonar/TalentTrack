// backend/utils/sendEmail.js
import nodeMailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
    const transporter = nodeMailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465,
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const mailOptions = {
        from: `"TalentTrack" <${process.env.SMTP_MAIL}>`,
        to: email,
        subject,
        text: message,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${email}`);
        return { success: true };
    } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        // Don't throw - just log the error and return failure
        // This prevents the application from crashing if email service is down
        return { success: false, error: error.message };
    }
};