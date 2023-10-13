const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
  //=========Checking user at routes, if user is valid continue else redirect to homepage(login/signup first)
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SEC, (err, decodedToken) => {
      if (err) {
        console.log("Auth middleware err: ", err);
        res.redirect("/");
      } else {
        // console.log("Auth middleware: ", decodedToken);
        next();
      }
    });
  } else {
    res.redirect("/");
  }
};
