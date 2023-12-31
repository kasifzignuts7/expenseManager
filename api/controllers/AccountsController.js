module.exports = {
  //========Main Account page============
  accountspage: async function (req, res) {
    const token = req.cookies.jwt;
    try {
      const loggedInUser = await sails.helpers.checkUser(token);
      const userAccounts = await Users.findOne({
        id: loggedInUser.id,
      }).populate("accounts");

      //Check if user in any account
      res.locals.account = userAccounts.accounts;
      return res.view("pages/account");
    } catch (err) {
      console.log("account page err", err);
      return res.redirect("/");
    }
  },
  //========Create Account page============
  create: async function (req, res) {
    const groupName = req.body.groupname;
    try {
      const loggedInUser = await await sails.helpers.checkUser(req.cookies.jwt);
      const createdGroup = await Accounts.create({
        name: groupName,
      }).fetch();

      //========Joining account with particular user==========
      await Users.addToCollection(loggedInUser.id, "accounts", createdGroup.id);
      return res.redirect("back");
    } catch (err) {
      console.log("account creation", err);
      return res.serverError(err);
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
      return res.redirect("back");
    } catch (err) {
      console.log("account deletion err", err);
      return res.redirect("back");
    }
  },
  //========Edit accountpage==========
  edit: async function (req, res) {
    try {
      const account = await Accounts.findOne({ id: req.params.id });
      //==========Find account and populate input fields with existing value=======
      return res.view("pages/editaccount", { a: account });
    } catch (err) {
      return res.redirect("/account");
    }
  },
  //========Edit accountpage name==========
  update: async function (req, res) {
    const name = req.body.groupname;
    try {
      await Accounts.update({ id: req.params.id }, { name: name });
      return res.redirect("/account");
    } catch (err) {
      return res.redirect("/account");
    }
  },
};
