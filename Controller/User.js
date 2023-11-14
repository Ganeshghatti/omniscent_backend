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

const authotp = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ghattiganesh8@gmail.com",
        pass: "gecy jkfr fzmy dcwf",
      },
    });

    const mailOptions = {
      from: "ghattiganesh8@gmail.com",
      to: `${email}`,
      subject: "OTP from Omniscent Perspectives",
      text: `Your otp is ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error.message);
    return false;
  }
};

exports.register = async (req, res, next) => {
  try {
    const userdata = req.body;
    console.log(userdata);

    if (!validator.isEmail(userdata.email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    if (!validator.isStrongPassword(userdata.password)) {
      return res.status(400).json({
        error:
          "Weak password. Must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const existingUser = await users.findOne({ email: userdata.email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(userdata.password, salt);

    let otp = Math.floor(Math.random() * 10000);
    otp = otp.toString().padStart(4, "0");

    const user = new users({
      username: userdata.username,
      email: userdata.email,
      password: hash,
      otp: otp,
    });

    const newUser = await user.save();

    const emailSent = await authotp(userdata.email, otp);
    if (!emailSent) {
      return res.status(500).json({ error: "Failed to send OTP email" });
    }

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

    if (userdata.otp === existingUser.otp) {
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

exports.login = async (req, res, next) => {
  const userdata = req.body;

  try {
    if (!validator.isEmail(userdata.email)) {
      return res.status(400).send("Enter a valid email");
    }
    const existingUser = await users.findOne({ email: userdata.email });
    if (!existingUser) {
      return res.status(400).send("Wrong email");
    }
    const match = await bcrypt.compare(
      userdata.password,
      existingUser.password
    );
    if (!match) {
      return res.status(400).send("Wrong password");
    }
    const jwttoken = jwt.sign(
      { userId: existingUser._id },
      process.env.JWTSECRET
    );

    res
      .status(200)
      .json({
        email: existingUser.email,
        username: existingUser.username,
        token: jwttoken,
      });
  } catch (error) {
    res.status(500).json("Failed to get user");
  }
};
