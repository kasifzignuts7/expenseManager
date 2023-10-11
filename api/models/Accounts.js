/**
 * Accounts.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    name: { type: "string", required: true },
    // members: { type: "json", columnType: "array" },
    members: {
      collection: "users",
      via: "accounts",
    },
    transactions: {
      collection: "transaction",
      via: "account",
    },
  },
};
