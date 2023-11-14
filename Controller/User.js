const users = require("../Model/User");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");

const app = express();
app.use(cors());
app.use(bodyParser.json());

exports.register = async (req, res, next) => {
  try {
    const userdata = req.body;

    // Validate email
    if (!validator.isEmail(userdata.email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // Validate password strength
    if (!validator.isStrongPassword(userdata.password)) {
      return res.status(400).json({
        error:
          "Weak password. Must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    // Check if the user already exists
    const existingUser = await users.findOne({ email: userdata.email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(userdata.password, salt);

    // Generate OTP
    let otp = Math.floor(Math.random() * 10000);
    otp = otp.toString().padStart(4, "0");

    // Create a new user
    const user = new users({
      username: userdata.username,
      email: userdata.email,
      password: hash,
      otp: otp,
    });

    // Save the user to the database
    const newUser = await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ghattiganesh8@gmail.com",
        pass: "kmgu ceko byxn trlz",
      },
    });

    const mailOptions = {
      from: "ghattiganesh8@gmail.com",
      to: `${userdata.email}`,
      subject: "OTP from Omniscent Perspectives",
      text: `Your otp is ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    // Respond with success
    res.status(200).json({ email: newUser.email, username: newUser.username });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to register user" });
  }
};

exports.auth = async (req, res, next) => {
  try {
    const userdata = req.body;
    console.log(userdata);

    const existingUser = await users.findOne({ email: userdata.email });

    if (!existingUser) {
      return res.status(400).json({ error: "User doesn't exist" });
    }
    console.log(typeof userdata.otp,typeof existingUser.otp)
    if (userdata.otp === existingUser.otp) {
      console.log("object")
      const jwttoken = jwt.sign(
        { userId: existingUser._id },
        process.env.JWTSECRET
      );
      res.status(200).json({
        email: existingUser.email,
        username: existingUser.username,
        jwttoken,
      });
    } else {
      res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error in authentication:", error);
    res.status(500).json({ error: "Failed to authenticate user" });
  }
};
