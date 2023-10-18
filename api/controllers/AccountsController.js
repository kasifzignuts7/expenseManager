/**
 * AccountsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  //========Main Account page============
  accountspage: async function (req, res) {
    const token = req.cookies.jwt;
    try {
      const loggedInUser = await sails.helpers.checkUser(token);
      const userAccounts = await Users.find({
        id: loggedInUser.id,
      }).populate("accounts");

      //Check if user in any account
      res.locals.account = userAccounts[0].accounts;
      res.view("pages/account");
    } catch (err) {
      console.log("account page err", err);
      res.redirect("/");
    }
  },
  //========Create Account page============
  create: async function (req, res) {
    const token = req.cookies.jwt;
    if (token) {
      const groupName = req.body.groupname;
      try {
        const loggedInUser = await await sails.helpers.checkUser(token);
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

  //========Delete account==========
  delete: async function (req, res) {
    /*If user deletes an account
      1. Remove link between account and transaction
      2. Remove link between account and members
      3. Delete all transaction from database which are linked with that account
      */
    try {
      //======Finding the linked transaction & members======
      const deleteAccTransactions = await Accounts.findOne({
        id: req.params.id,
      }).populate("transactions");

      const deleteAccMembers = await Accounts.findOne({
        id: req.params.id,
      }).populate("members");

      const transactionsToBeDeleted = deleteAccTransactions.transactions.map(
        (indTransc) => indTransc.id
      );
      const membersToBeRemoved = deleteAccMembers.members.map(
        (member) => member.id
      );

      //======== 1. Removing link between account and member==========
      await Accounts.removeFromCollection(req.params.id, "members").members(
        membersToBeRemoved
      );

      // //======== 2. Removing link between account and transactions===========
      await Accounts.removeFromCollection(
        req.params.id,
        "transactions"
      ).members(transactionsToBeDeleted);

      //======== 3. Delete all transaction from database which are linked with that account===========
      await Transaction.destroy({
        id: { in: transactionsToBeDeleted },
      });

      //=======At last delete the account=======
      const deletedAcc = await Accounts.destroyOne({ id: req.params.id });
      res.redirect("/account");
    } catch (err) {
      console.log("account deletion err", err);
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
