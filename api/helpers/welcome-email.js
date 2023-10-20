const nodemailer = require("nodemailer");
require("dotenv").config()

//Node mailer
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    // type: "OAuth2",
    user: sails.config.custom.sendermail,
    pass: process.env.mailPass,
    // clientId: process.env.OAUTH_CLIENTID,
    // clientSecret: process.env.OAUTH_CLIENT_SECRET,
    // refreshToken: process.env.OAUTH_REFRESH_TOKEN
  },
});
module.exports = {
  friendlyName: "Welcome email",

  description: "",

  inputs: {
    user: {
      type: "ref",
      example: "Ami",
      description: "The name of the person to greet.",
      required: true,
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: async function (inputs) {
    const info = await transporter.sendMail({
      from: '"xpense manager" <xpensemanager@google.com>', // sender address
      to: inputs.user.email, // list of receivers
      subject:
        "Welcome to xPense manager  - Your Smart Solution for Financial Tracking!", // Subject line
      text: `Dear ${inputs.user.name},
      Welcome to xPense manager app! Simplify your financial tracking with our intuitive app. Log expenses, set budgets, and gain control.`, // plain text body
      // html: "", // html body
    });
  },
};
