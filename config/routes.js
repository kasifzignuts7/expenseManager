/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

const UsersController = require("../api/controllers/UsersController");

module.exports.routes = {
  "/": "DashboardController.homepage",

  //user routes
  "POST /signup": "UsersController.signup",
  "POST /login": "UsersController.login",
  "GET /logout": "UsersController.logout",

  //account routes
  "GET /account": "AccountsController.accountspage",
  "POST /account/add": "AccountsController.create",
  "GET /account/delete/:id": "AccountsController.delete",
  "GET /account/edit/:id": "AccountsController.edit",
  "POST /account/update/:id": "AccountsController.update",

  //transactions routes
  "GET /transactions/:id": "TransactionController.transactionpage",
  "POST /account/addmember/:id": "TransactionController.addmember",
  "POST /transactions/add/:ac": "TransactionController.create",
  "GET /transactions/delete/:id/:ac": "TransactionController.delete",
  "GET /transactions/edit/:id/:ac": "TransactionController.edit",
  "POST /transactions/update/:id/:ac": "TransactionController.update",
  "GET /transactions/transfer/:ac": "TransactionController.transferpage",
  "POST /transactions/transfer/:ac": "TransactionController.transfer",
  "GET /transactions/transfer/edit/:id/:ac":
    "TransactionController.edittransfer",
  "POST /transactions/transfer/update/:id/:ac":
    "TransactionController.updatetransfer",
};
