/**
 * Transaction.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    account: {
      model: "accounts",
    },
    owner: {
      model: "users",
    },
    transactiontype: { type: "string", required: true },
    desc: { type: "string", required: true },
    amount: { type: "number", required: true },
    transferto: { type: "string" },
    transferfrom: { type: "string" },
  },
};
