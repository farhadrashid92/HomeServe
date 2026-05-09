import nodemailer from 'nodemailer';
import dns from 'dns';

const sendEmail = async (options) => {
  // Check if real SMTP credentials exist
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    
    // Manually resolve IPv4 address to completely bypass Node.js IPv6 routing bugs on Render
    const ipv4Address = await new Promise((resolve) => {
      dns.resolve4('smtp.gmail.com', (err, addresses) => {
        if (err || !addresses || addresses.length === 0) {
          resolve('smtp.gmail.com'); // Fallback to hostname if DNS resolution fails
        } else {
          resolve(addresses[0]);
        }
      });
    });

    // Create a transporter using your SMTP provider (e.g. Gmail)
    const transporter = nodemailer.createTransport({
      host: ipv4Address,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        servername: 'smtp.gmail.com', // Crucial for TLS handshake since we are connecting via raw IP
      }
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
