const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SEC, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else if (decodedToken) {
        const user = await Users.findOne({ id: decodedToken.id });
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};
