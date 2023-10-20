const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
  friendlyName: "Generate jwt",

  description: "",

  inputs: {
    id: {
      type: "string",
      example: "dddsfsgsgsdsf",
      description: "user id",
      required: true,
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: async function (inputs) {
    const id = inputs.id;
    return jwt.sign({ id }, process.env.JWT_SEC, {
      expiresIn: "3d",
    });
  },
};
