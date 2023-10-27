module.exports = {
  transactionpage: async function (req, res) {
    try {
      const transactions = await Accounts.findOne({
        id: req.params.id,
      }).populate("transactions");

      //==========Reversing the Transaction==========
      const transactionss = transactions.transactions.reverse();
      const memberWiseTransactions = [];

      if (transactionss) {
        const forUserbalance = transactions.transactions;
        for (const transaction of forUserbalance) {
          const tr = await Transaction.findOne({
            id: transaction.id,
          }).populate("owner");
          memberWiseTransactions.push(tr);
        }
      }

      const userBalances = new Map();

      // Helper function to update the balance in the map
      function updateBalance(userId, amount) {
        //========Create distinct user list with their balances with MAP==========
        if (!userBalances.has(userId)) {
          const owner = memberWiseTransactions.find((transaction) => {
            return transaction.owner.id === userId;
          })?.owner;

          userBalances.set(userId, { name: owner?.name, balance: 0 });
        }
        userBalances.get(userId).balance += amount;
      }
      // ==========Looping helper function on each fields===========
      memberWiseTransactions.forEach((transaction) => {
        const { owner, transactiontype, amount, transferto, transferfrom } =
          transaction;
        const ownerId = owner.id;

        if (transactiontype === "income") {
          updateBalance(ownerId, amount); // Credit
        } else if (transactiontype === "expense") {
          updateBalance(ownerId, -amount); // Debit
        } else if (transactiontype === "transfer") {
          updateBalance(ownerId, -amount); //Debit from sender's account
          if (transferto) {
            updateBalance(transferto, amount); //Credit in receiver's account
          }
        }
      });
      const userDetailsArray = Array.from(userBalances.values());

      //=========for Total sum========
      const totalsum = memberWiseTransactions.reduce((sum, tr) => {
        if (tr.transactiontype == "expense") {
          sum -= tr.amount;
        } else if (tr.transactiontype == "income") {
          sum += tr.amount;
        }
        return sum;
      }, 0);

      //===========For Members List==========
      const members = await Accounts.find({ id: req.params.id }).populate(
        "members"
      );

      return res.view("pages/transaction", {
        expenses: transactionss,
        members: members[0].members,
        accountid: req.params.id,
        userWiseAmount: userDetailsArray,
        totalsum: totalsum,
      });
    } catch (err) {
      console.log("transaction page err", err);
      return res.serverError(err);
    }
  },
  //===========Create Transaction==========
  create: async function (req, res) {
    const { transactiontype, desc, amount } = req.body;

    try {
      const newTransaction = await Transaction.create({
        transactiontype,
        desc,
        amount,
      }).fetch();

      const createdBy = await sails.helpers.checkUser(req.cookies.jwt);

      //===========Linking transaction between user and account==========
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
      return res.redirect("back");
    } catch (err) {
      console.log("transaction create error", err);
      return res.redirect("back");
    }
  },
  //===========Delete Transaction==========
  delete: async function (req, res) {
    try {
      const deletedTransation = await Transaction.destroyOne({
        id: req.params.id,
      });
      const createdBy = await sails.helpers.checkUser(req.cookies.jwt);
      //===========Removing link between account and user==========
      await Accounts.removeFromCollection(
        req.params.ac,
        "transactions",
        req.params.id
      );
      await Users.removeFromCollection(
        createdBy.id,
        "indtransaction",
        req.params.id
      );
      return res.redirect("back");
    } catch (err) {
      console.log("transaction delete error", err);
      return res.redirect("back");
    }
  },
  //===========Edit Transaction==========
  edit: async function (req, res) {
    try {
      //===========Finding transaction and populate page with input values==========
      const transaction = await Transaction.findOne({ id: req.params.id });

      return res.view("pages/edittransaction", {
        expense: transaction,
        accountid: req.params.ac,
      });
    } catch (err) {
      console.log("transaction edit error", err);
      return res.redirect(`/transactions/${req.params.ac}`);
    }
  },
  //===========Update Transaction==========
  update: async function (req, res) {
    const data = req.body;

    try {
      const transaction = await Transaction.update({ id: req.params.id }, data);
      return res.redirect(`/transactions/${req.params.ac}`);
    } catch (err) {
      console.log("transaction update error", err);
      return res.redirect(`/transactions/${req.params.ac}`);
    }
  },
  //===========Adding new member==========
  addmember: async function (req, res) {
    try {
      const newMember = await Users.findOne({ email: req.body.memberemail });

      //===========Only registered memeber can be added in account==========
      if (newMember) {
        //===========If found linking with particular account==========
        await Accounts.addToCollection(req.params.id, "members", newMember.id);
        return res.redirect("back");
      }
      console.log("Not a valid user...");
      return res.redirect("back");
    } catch (err) {
      console.log("add member err", err);
      return res.redirect("back");
    }
  },
  //===========Transfer page==========
  transferpage: async function (req, res) {
    try {
      const account = await Accounts.findOne({ id: req.params.ac }).populate(
        "members"
      );
      const loggedInUser = await sails.helpers.checkUser(req.cookies.jwt);

      //===========Removing logged in user from list because member can't transfer amount to themself==========
      const members = account.members.filter(
        (member) => member.id != loggedInUser.id
      );

      return res.view("pages/transfer", {
        members: members,
        accountid: req.params.ac,
      });
    } catch (err) {
      console.log("transfer page err", err);
      return res.redirect("back");
    }
  },
  //===========Create transfer==========
  transfer: async function (req, res) {
    try {
      let { transfermember, amount } = req.body;
      transfermember = await Users.findOne({ id: transfermember });
      const createdBy = await sails.helpers.checkUser(req.cookies.jwt);

      const newTransaction = await Transaction.create({
        transferto: transfermember.id,
        transferfrom: createdBy.id,
        amount,
        desc: `Transfer to ${transfermember.name}`,
        transactiontype: "transfer",
      }).fetch();

      //===========Linking with account and user==========
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
      return res.redirect(`/transactions/${req.params.ac}`);
    } catch (err) {
      console.log("transfer err", err);
      return res.redirect(`/transactions/${req.params.ac}`);
    }
  },
  //===========Edit transfer page==========
  edittransfer: async function (req, res) {
    const { id, ac } = req.params;
    try {
      const transaction = await Transaction.findOne({ id: id });
      const account = await Accounts.findOne({ id: ac }).populate("members");
      const loggedInUser = await sails.helpers.checkUser(req.cookies.jwt);

      //===========Removing logged in user from list because member can't transfer amount to themself==========
      const members = account.members.filter(
        (member) => member.id != loggedInUser.id
      );

      return res.view("pages/edittransfer", {
        members: members,
        tr: transaction,
        transactionid: id,
        accountid: req.params.ac,
      });
    } catch (err) {
      console.log("edit transfer err", err);
      return res.redirect(`/transactions/${ac}`);
    }
  },
  //===========Update transfer page==========
  updatetransfer: async function (req, res) {
    const data = req.body;

    try {
      const transaction = await Transaction.update({ id: req.params.id }, data);
      return res.redirect(`/transactions/${req.params.ac}`);
    } catch (err) {
      console.log("transaction update error", err);
      return res.redirect(`/transactions/${req.params.ac}`);
    }
  },
};
