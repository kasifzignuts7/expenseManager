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
      console.log("accounts check user err: ", err);
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
    const trr = [];
  
    if (transactionss) {
      const forUserbalance = transactions[0].transactions;
      for (const transaction of forUserbalance) {
        const tr = await Transaction.findOne({
          id: transaction.id,
        }).populate("owner");
        trr.push(tr);
      }
    }

    const userBalances = new Map();

    // Helper function to update the balance in the map
    function updateBalance(userId, amount) {
      if (!userBalances.has(userId)) {
        const owner = trr.find(
          (transaction) => transaction.owner.id === userId
        ).owner;
        userBalances.set(userId, { name: owner.name, balance: 0 });
      }
      userBalances.get(userId).balance += amount;
    }

    trr.forEach((transaction) => {
      const { owner, transactiontype, amount, transferto, transferfrom } =
        transaction;
      const ownerId = owner.id;

      if (transactiontype === "income") {
        updateBalance(ownerId, amount); // Credit
      } else if (transactiontype === "expense") {
        updateBalance(ownerId, -amount); // Debit
      } else if (transactiontype === "transfer") {
        updateBalance(ownerId, -amount);
        if (transferto) {
          updateBalance(transferto, amount);
        }
      }
    });

    const totalsum = trr.reduce((sum, tr) => {
      if (tr.transactiontype == "expense") {
        sum -= tr.amount;
      } else if (tr.transactiontype == "income") {
        sum += tr.amount;
      }
      return sum;
    }, 0);

    const userDetailsArray = Array.from(userBalances.values());

    const members = await Accounts.find({ id: req.params.id }).populate(
      "members"
    );

    res.view("pages/transaction", {
      expenses: transactionss,
      members: members[0].members,
      accountid: req.params.id,
      userWiseAmount: userDetailsArray,
      totalsum: totalsum,
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
      console.log("transaction delete error", err);
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
      console.log("transaction edit error", err);
      res.redirect(`/transactions/${req.params.ac}`);
    }
  },
  update: async function (req, res) {
    const data = req.body;

    try {
      const transaction = await Transaction.update({ id: req.params.id }, data);
      res.redirect(`/transactions/${req.params.ac}`);
    } catch (err) {
      console.log("transaction update error", err);
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
        console.log("Not a valid user...");
        res.redirect(`/transactions/${req.params.id}`);
      }
    } catch (err) {
      console.log("add member err", err);
      res.redirect(`/transactions/${req.params.id}`);
    }
  },
  transferpage: async function (req, res) {
    const account = await Accounts.findOne({ id: req.params.ac }).populate(
      "members"
    );
    const loggedInUser = await checkUser(req.cookies.jwt);
    const members = account.members.filter(
      (member) => member.id != loggedInUser.id
    );

    res.view("pages/transfer", {
      members: members,
      accountid: req.params.ac,
    });
  },
  transfer: async function (req, res) {
    try {
      let { transfermember, amount } = req.body;
      transfermember = await Users.findOne({ id: transfermember });
      const createdBy = await checkUser(req.cookies.jwt);

      const newTransaction = await Transaction.create({
        transferto: transfermember.id,
        transferfrom: createdBy.id,
        amount,
        desc: `Transfer to ${transfermember.name}`,
        transactiontype: "transfer",
      }).fetch();

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
      console.log("transfer err", err);
      res.redirect(`/transactions/${req.params.ac}`);
    }
  },
  edittransfer: async function (req, res) {
    const { id, ac } = req.params;
    try {
      const transaction = await Transaction.findOne({ id: id });
      const account = await Accounts.findOne({ id: ac }).populate("members");
      const loggedInUser = await checkUser(req.cookies.jwt);
      const members = account.members.filter(
        (member) => member.id != loggedInUser.id
      );

      res.view("pages/edittransfer", {
        members: members,
        transactionid: id,
        accountid: req.params.ac,
        tr: transaction,
      });
    } catch (err) {
      console.log("edit transfer err", err);
      //res.redirect(`/transactions/${ac}`);
    }
  },
  updatetransfer: async function (req, res) {
    const data = req.body;

    try {
      const transaction = await Transaction.update({ id: req.params.id }, data);
      res.redirect(`/transactions/${req.params.ac}`);
    } catch (err) {
      console.log("transaction update error", err);
      res.redirect(`/transactions/${req.params.ac}`);
    }
  },
};
