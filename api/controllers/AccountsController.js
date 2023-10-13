const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * AccountsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

//========JWT verify user helper function==========
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
  //========Main Account page============
  main: async function (req, res) {
    const token = req.cookies.jwt;
    if (token) {
      try {
        const loggedInUser = await checkUser(token);
        const userAccounts = await Users.find({
          id: loggedInUser.id,
        }).populate("accounts");

        //Check if user in any account
        res.locals.account = userAccounts[0].accounts;
        res.view("pages/account");
      } catch (err) {
        console.log(err);
        res.redirect("/");
      }
    } else {
      res.redirect("/");
    }
  },
  //========Create Account page============
  create: async function (req, res) {
    const token = req.cookies.jwt;
    if (token) {
      const groupName = req.body.groupname;
      try {
        const loggedInUser = await checkUser(token);
        const createdGroup = await Accounts.create({
          name: groupName,
        }).fetch();

        //========Joining account with particular user==========
        await Users.addToCollection(
          loggedInUser.id,
          "accounts",
          createdGroup.id
        );
        res.redirect("/account");
      } catch (err) {
        console.log(err);
        res.status(400).json({ message: "account creation error" });
      }
    } else {
      res.redirect("/");
    }
  },

  //========Delete account page==========
  delete: async function (req, res) {
    try {
      const deletedAcc = await Accounts.destroyOne({ id: req.params.id });
      const loggedInUser = await checkUser(token);

      //========Removing link between user and account page==========
      await Users.removeFromCollection(
        loggedInUser.id,
        "accounts",
        req.params.id
      );
      res.redirect("/account");
    } catch (err) {
      res.redirect("/account");
    }
  },
  //========Edit accountpage==========
  edit: async function (req, res) {
    try {
      const account = await Accounts.findOne({ id: req.params.id });
      //==========Find account and populate input fields with existing value=======
      res.view("pages/editaccount", { a: account });
    } catch (err) {
      res.redirect("/account");
    }
  },
  //========Edit accountpage name==========
  update: async function (req, res) {
    const name = req.body.groupname;
    try {
      await Accounts.update({ id: req.params.id }, { name: name });
      res.redirect("/account");
    } catch (err) {
      res.redirect("/account");
    }
  },
};
