const express = require("express");
const router = express.Router();
const {register, auth, login, form}=require("../Controller/User")
const requireAuth=require('../middleware/User')

// router.route("/register").post(register);
// router.route("/auth").post(auth);
// router.route("/login").post(login);
router.route("/form").post(form);

module.exports = router;
