const express = require("express");
const router = express.Router();
const {register, auth, login}=require("../Controller/User")

router.route("/register").post(register);
router.route("/auth").post(auth);
router.route("/login").post(login);

module.exports = router;
