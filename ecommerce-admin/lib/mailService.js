var nodemailer = require("nodemailer");

export async function sendMail(recipient, theme, html, attachments, orderId) {
  if (!Array.isArray(attachments)) attachments = [];

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PW,
    },
  });

  let mailOptions = {
    from: 'illya.bakhmet.smolensky@gmail.com',
    to: recipient,
    subject: theme,
    html: html,
    attachments: attachments.map(data => {
      if (typeof data === 'string') {
        return {
          filename: `invoice_no_${orderId}.pdf`,
          content: data.split(",")[1],
          encoding: 'base64',
        };
      } else {
        return data;
      }
    }),
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      throw new Error(error);
    } else {
      console.log("Email Sent: ", info);
      return true;
    }
  });
};