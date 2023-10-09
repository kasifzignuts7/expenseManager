/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {
  DashboardController: {
    homepage: "checkUser",
    dashboard: ["authMiddleware", "checkUser"],
  },
  AccountsController: {
    "*": ["authMiddleware", "checkUser"],
  },
  ExpenseController: {
    "*": ["authMiddleware", "checkUser"],
  },
  /***************************************************************************
   *                                                                          *
   * Default policy for all controllers and actions, unless overridden.       *
   * (`true` allows public access)                                            *
   *                                                                          *
   ***************************************************************************/
  // '*': true,
};
