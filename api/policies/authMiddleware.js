const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
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
