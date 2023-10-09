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

  //User routes
  "POST /signup": "UsersController.signup",
  "POST /login": "UsersController.login",
  "GET /logout": "UsersController.logout",

  //account routes
  "GET /account": "AccountsController.main",
  "POST /account/add": "AccountsController.create",
  "GET /account/delete/:id": "AccountsController.delete",
  "GET /account/edit/:id": "AccountsController.edit",
  "POST /account/update/:id": "AccountsController.update",

  //expense routes
  "GET /expense/:id": "ExpenseController.expensepage",
  "POST /expense/add": "ExpenseController.create",
  "POST /expense/addmember": "ExpenseController.addmember",
  "GET /expense/delete/:id": "ExpenseController.delete",
  "GET /expense/edit/:id": "ExpenseController.edit",
  "POST /expense/update/:id": "ExpenseController.update",
};
