const jwt = require("jsonwebtoken");
const User = require("../Model/User");

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }
  const token = authorization.split(" ")[1];

  try {
    const userid = jwt.verify(token, process.env.JWTSECRET).userId;
    const user = await User.findOne({ _id: userid });

    if (user) {
      req.user = user;
    } else {
      console.log("User not found");
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = requireAuth;
