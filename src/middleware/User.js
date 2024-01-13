const jwt = require("jsonwebtoken");
const User = require("../Model/User");

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  console.log(authorization);
  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }
  const token = authorization.split(" ")[1];

  try {
    const userid = jwt.verify(token, process.env.JWTSECRET).userId;
    const user = await User.findOne({ _id: userid });
    console.log(user);
    if (user) {
      req.user = user;
    } else {
      res.status(401).json({ error: "Request is not authorized" });
    }
    next();
  } catch (error) {
    res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = requireAuth;
