import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: process.env.EMAIL_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USERNAME || 'your-mailtrap-username',
        pass: process.env.EMAIL_PASSWORD || 'your-mailtrap-password',
      },
      // Add debug option for development
      debug: process.env.NODE_ENV === 'development',
    });

    // 2) Define the email options
    const mailOptions = {
      from: 'PeakForce Attendance <noreply@peakforce.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    // Return false instead of throwing error
    return false;
  }
};

export default sendEmail;
