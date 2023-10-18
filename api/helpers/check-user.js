const jwt = require("jsonwebtoken");
require("dotenv").config();
module.exports = {
  friendlyName: "Check user",

  description: "",

  inputs: {
    token: {
      type: "string",
      example: "dddsfsgsgsdsf",
      description: "token from cookie",
      required: true,
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: async function (inputs) {
    return jwt.verify(
      inputs.token,
      process.env.JWT_SEC,
      async (err, decodedToken) => {
        if (err) {
          console.log("accounts check user: ", err);
        } else if (decodedToken) {
          const user = await Users.findOne({ id: decodedToken.id });
          return user;
        }
      }
    );
  },
};
