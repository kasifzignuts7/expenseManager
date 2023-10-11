const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

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
  transactionpage: async function (req, res) {
    const transactions = await Accounts.find({ id: req.params.id }).populate(
      "transactions"
    );
    const transactionss = transactions[0].transactions.reverse();

    if (transactionss) {
      for (const transaction of transactionss) {
        console.log("tr", transaction);
        // const trr = await Transaction.find({
        //   id: transactions[0].transactions[0].id,
        // }).populate("owner");
      }
    }

    const members = await Accounts.find({ id: req.params.id }).populate(
      "members"
    );
    console.log("members", members[0].members);

    res.view("pages/transaction", {
      expenses: transactionss,
      members: members[0].members,
      accountid: req.params.id,
    });
  },
  create: async function (req, res) {
    const { transactiontype, desc, amount } = req.body;

    try {
      const newTransaction = await Transaction.create({
        transactiontype,
        desc,
        amount,
      }).fetch();

      const createdBy = await checkUser(req.cookies.jwt);

      await Accounts.addToCollection(
        req.params.ac,
        "transactions",
        newTransaction.id
      );
      await Users.addToCollection(
        createdBy.id,
        "indtransaction",
        newTransaction.id
      );
      res.redirect(`/transactions/${req.params.ac}`);
    } catch (err) {
      console.log("transaction create error", err);
      res.redirect(`/transactions/${req.params.ac}`);
      // res.status(400).json(err).redirect("/account");
    }
  },
  delete: async function (req, res) {
    try {
      const deletedTransations = await Transaction.destroyOne({
        id: req.params.id,
      });
      await Accounts.removeFromCollection(
        req.params.ac,
        "transactions",
        req.params.id
      );
      res.redirect(`/transactions/${req.params.ac}`);
    } catch (err) {
      res.redirect(`/transactions/${req.params.ac}`);
    }
  },
  edit: async function (req, res) {
    try {
      const transaction = await Transaction.findOne({ id: req.params.id });
      res.view("pages/edittransaction", {
        expense: transaction,
        accountid: req.params.ac,
      });
    } catch (err) {
      res.redirect(`/transactions/${req.params.ac}`);
    }
  },
  update: async function (req, res) {
    const data = req.body;

    try {
      const transaction = await Transaction.update({ id: req.params.id }, data);
      res.redirect(`/transactions/${req.params.ac}`);
    } catch (err) {
      res.redirect(`/transactions/${req.params.ac}`);
    }
  },
  addmember: async function (req, res) {
    try {
      const newMember = await Users.findOne({ email: req.body.memberemail });
      if (newMember) {
        await Accounts.addToCollection(req.params.id, "members", newMember.id);
        res.redirect(`/transactions/${req.params.id}`);
      } else {
        res.redirect(`/transactions/${req.params.id}`);
      }
    } catch (err) {
      console.log("add member err", err);
    }
  },
};