module.exports = {
  friendlyName: "Add default data",

  description: "",

  inputs: {
    userId: {
      type: "string",
      example: "dddsfsgsgsdsf",
      description: "token from cookie",
      required: true,
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
    error: {
      description: "Error occurred",
    },
  },

  fn: async function (inputs, exits) {
    const sampleData = [{ name: "Your last trip" }, { name: "Your apartment" }];
    try {
      let createdAccount = await Accounts.createEach(sampleData).fetch();
      createdAccount = createdAccount.map((ac) => {
        return ac.id;
      });
      await Users.addToCollection(inputs.userId, "accounts").members(
        createdAccount
      );
      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
