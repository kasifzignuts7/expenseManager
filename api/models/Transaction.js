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
    transactiontype: { type: "string", required: true },
    desc: { type: "string", required: true },
    amount: { type: "number", required: true },
  },
};
