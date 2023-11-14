const express = require("express");
const router = express.Router();
const {register, auth}=require("../Controller/User")

router.route("/register").post(register);
router.route("/auth").post(auth)

module.exports = router;
