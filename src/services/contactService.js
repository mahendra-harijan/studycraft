const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const hasSmtpConfig = () =>
  Boolean(env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPass && env.contactToEmail);

const isMailConfigured = () => hasSmtpConfig();

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass
      }
    });
  }

  return transporter;
};

const sendViaSmtp = async ({ name, email, subject, message }) => {
  const mailTransporter = getTransporter();
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message);

  const sent = await mailTransporter.sendMail({
    from: env.smtpFromEmail || env.smtpUser,
    to: env.contactToEmail,
    replyTo: email,
    subject: `[StudyCraft Contact] ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Subject:</strong> ${safeSubject}</p>
      <hr />
      <p style="white-space: pre-line;">${safeMessage}</p>
    `
  });

  return sent;
};

const sendContactEmail = async ({ name, email, subject, message }) => {
  return sendViaSmtp({ name, email, subject, message });
};

module.exports = { isMailConfigured, sendContactEmail };
