import nodemailer from 'nodemailer';
import dns from 'dns';

// Force Node.js to use IPv4 instead of IPv6 for all DNS lookups
// This fixes the ENETUNREACH IPv6 issue on Render.
dns.setDefaultResultOrder('ipv4first');
const sendEmail = async (options) => {
  // Check if real SMTP credentials exist
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Create a transporter using your SMTP provider (e.g. Gmail)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Force IPv4 to prevent ENETUNREACH on environments without IPv6 routing
      family: 4,
    });

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'HomeServe'} <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
  } else {
    // Fallback: log the email to the console if no credentials are provided
    console.log('\n--- EMAIL LOG (NO CREDENTIALS CONFIGURED) ---');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.message}`);
    console.log('---------------------------------------------\n');
  }
};

export default sendEmail;
