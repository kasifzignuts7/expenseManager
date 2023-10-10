const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * AccountsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

// const Accounts = require("../models/Accounts");

// const Accounts = require("../models/Accounts");

async function checkUser(token) {
  return jwt.verify(token, process.env.JWT_SEC, async (err, decodedToken) => {
    if (err) {
      console.log("accounts check user: ", err);
    } else if (decodedToken) {
      const user = await Users.findOne({ id: decodedToken.id });
      return user;
    }
  });
}

module.exports = {
  main: async function (req, res) {
    const token = req.cookies.jwt;
    if (token) {
      try {
        const loggedInUser = await checkUser(token);
        const accounts = await Accounts.find({ members: loggedInUser.id });
        res.locals.account = accounts;
        res.view("pages/account");
      } catch (err) {
        res.redirect("/");
      }
    } else {
      res.redirect("/");
    }
  },
  create: async function (req, res) {
    const groupName = req.body.groupname;
    const token = req.cookies.jwt;
    if (token) {
      try {
        const loggedInUser = await checkUser(token);
        const newGroup = await Accounts.create({
          name: groupName,
          members: [loggedInUser.id],
        });
        res.redirect("/account");
      } catch (err) {
        res.status(400).json({ message: "account creation error" });
      }
    } else {
      res.redirect("/");
    }
  },
  delete: async function (req, res) {
    try {
      const deletedAcc = await Accounts.destroyOne({ id: req.params.id });
      res.redirect("/account");
    } catch (err) {
      res.redirect("/account");
    }
  },
  edit: async function (req, res) {
    try {
      const account = await Accounts.findOne({ id: req.params.id });
      res.view("pages/editaccount", { a: account });
    } catch (err) {
      res.redirect("/account");
    }
  },
  update: async function (req, res) {
    const name = req.body.groupname;
    try {
      const account = await Accounts.update(
        { id: req.params.id },
        { name: name }
      );
      res.redirect("/account");
    } catch (err) {
      res.redirect("/account");
    }
  },
};
