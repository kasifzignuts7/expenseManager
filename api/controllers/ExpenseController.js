/**
 * ExpenseController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
let id;
var memberslist = [];
module.exports = {
  expensepage: async function (req, res) {
    memberslist = [];
    id = req.params.id;
    let expenses = await Expense.find({ groupid: id });
    expenses = expenses.reverse();
    // .sort({ createdAt: -1 })
    const { members } = await Accounts.findOne({ id });

    for (let i = 0; i < members.length; i++) {
      const member = await Users.findOne({ id: members[i] });
      memberslist.push(member);
    }
    res.view("pages/expense", { expenses: expenses, members: memberslist });
  },
  create: async function (req, res) {
    const transactiontype = req.body.transactiontype;
    const desc = req.body.desc;
    const amount = req.body.amount;

    try {
      const newExpense = await Expense.create({
        groupid: id,
        transactiontype,
        desc,
        amount,
      });
      res.redirect(`/expense/${id}`);
    } catch (err) {
      res.status(400).json(err);
      res.redirect("/account");
    }
  },
  addmember: async function (req, res) {
    try {
      const newMemberAcc = await Users.findOne({ email: req.body.memberemail });
      if (newMemberAcc) {
        memberslist.push(newMemberAcc);
        const members = [];
        for (var i = 0; i < memberslist.length; i++) {
          members.push(memberslist[i].id);
        }
        const tobeupdated = await Accounts.findOne({ id });

        tobeupdated.members = members;

        const updatedMembersList = await Accounts.updateOne(
          { id },
          tobeupdated
        );
        res.redirect(`/expense/${id}`);
      } else {
        res.redirect(`/expense/${id}`);
      }
    } catch (err) {
      console.log(err);
    }
  },
  delete: async function (req, res) {
    try {
      const deletedExpense = await Expense.destroyOne({ id: req.params.id });
      res.redirect(`/expense/${id}`);
    } catch (err) {
      console.log(err);
      res.redirect(`/expense/${id}`);
    }
  },
  edit: async function (req, res) {
    try {
      const expense = await Expense.findOne({ id: req.params.id });
      res.view("pages/edittransaction", { expense: expense });
    } catch (err) {
      console.log(err);
      res.redirect(`/expense/${id}`);
    }
  },
  update: async function (req, res) {
    const data = req.body;
    try {
      const expense = await Expense.update({ id: req.params.id }, data);
      res.redirect(`/expense/${id}`);
    } catch (err) {
      console.log(err);
      res.redirect(`/expense/${id}`);
    }
  },
};
