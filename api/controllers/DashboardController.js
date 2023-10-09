/**
 * DashboardController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  //Homepage
  homepage: function (req, res) {
    // console.log("hey");
    res.view("pages/homepage");
  },
  //Dashboard
  dashboard: async function (req, res) {
    res.view("pages/dashboard");
  },
};
