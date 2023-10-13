require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

//Node mailer
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    // type: "OAuth2",
    user: "zignutsexpensemanager@gmail.com",
    pass: "fbyhcjoazmjetlyo",
    // clientId: process.env.OAUTH_CLIENTID,
    // clientSecret: process.env.OAUTH_CLIENT_SECRET,
    // refreshToken: process.env.OAUTH_REFRESH_TOKEN
  },
});

// send mail with defined transport object
async function welcomeEmail(user) {
  const info = await transporter.sendMail({
    from: '"xpense manager" <xpensemanager@google.com>', // sender address
    to: user.email, // list of receivers
    subject:
      "Welcome to xPense manager  - Your Smart Solution for Financial Tracking!", // Subject line
    text: `Dear ${user.name},
    Welcome to xPense manager app! Simplify your financial tracking with our intuitive app. Log expenses, set budgets, and gain control.`, // plain text body
    // html: "", // html body
  });

  // console.log("Message sent: %s", info.messageId);
}

//PASSWORD HASHING
const bcryptSalt = bcrypt.genSaltSync(10);

//JWT Token generation
function jwtToken(id) {
  return jwt.sign({ id }, process.env.JWT_SEC, {
    expiresIn: "3d",
  });
}

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
      const token = await jwtToken(newUser.id);
      res
        .status(200)
        .cookie("jwt", token, {
          httpOnly: true,
          maxAge: 72 * 60 * 60 * 1000,
        })
        .json(newUser);
      //=========Welcome email function call========
      welcomeEmail(newUser).catch(console.error);
    } catch (err) {
      console.log(err);
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
          const token = await jwtToken(user.id);
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
      res.status(400).send({ message: "User login error. Please try again." });
    }
  },
  //=========Logout user and clear token in cookie========
  logout: function (req, res) {
    res.clearCookie("jwt").redirect("/");
  },
};
