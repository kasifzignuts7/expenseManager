const bcrypt = require("bcrypt");

//FOR PASSWORD HASHING
const bcryptSalt = bcrypt.genSaltSync(10);

module.exports = {
  //=========Sign Up user========
  signup: async function (req, res) {
    const { name, email, password } = req.body;

    try {
      //=========Creating new user with hashed password========
      const newUser = await Users.create({
        name,
        email,
        password: bcrypt.hashSync(password, bcryptSalt),
      }).fetch();

      //=========Passing jwt token in cookie with 3d validity========
      const token = await sails.helpers.generateJwt(newUser.id);
      res
        .status(200)
        .cookie("jwt", token, {
          httpOnly: true,
          maxAge: 72 * 60 * 60 * 1000,
        })
        .json(newUser);
      //=========Welcome email function call========
      await sails.helpers.welcomeEmail(newUser);
    } catch (err) {
      if (err.code === "E_UNIQUE") {
        res.status(400).json({
          message: "User is already registered. Try to login",
          error: err,
        });
      } else {
        res
          .status(400)
          .json({ message: "Sign up error. Please try again", error: err });
      }
    }
  },
  //=========Login user========
  login: async function (req, res) {
    const { email, password } = req.body;

    try {
      //=========Check if user exists in db========
      const user = await Users.findOne({ email });
      if (user) {
        const hashedPasswordCheck = bcrypt.compareSync(password, user.password);
        //=========Check if password match with hashed password in db========
        if (hashedPasswordCheck) {
          //=========If password match, generate jwt token and pass in cookie========
          const token = await sails.helpers.generateJwt(user.id);

          res
            .status(200)
            .cookie("jwt", token, {
              httpOnly: true,
              maxAge: 72 * 60 * 60 * 1000,
            })
            .json(user);
        } else {
          //=========User found but password is wrong========
          res
            .status(400)
            .send({ message: "Please check the entered password." });
        }
      } else {
        //=========User not found in db========
        res
          .status(400)
          .send({ message: "Please check the email and password." });
      }
    } catch (err) {
      console.log("login err", err);
      res.status(400).send({ message: "User login error. Please try again." });
    }
  },
  //=========Logout user and clear token in cookie========
  logout: function (req, res) {
    res.clearCookie("jwt").redirect("/");
  },
};
