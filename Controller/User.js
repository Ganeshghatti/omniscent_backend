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
  const userdata = req.body;
  console.log(userdata);
  try {
    if (userdata.password) {
      if (!validator.isEmail(userdata.email)) {
        return res.status(400).send("Enter a valid email");
      }
      if (!validator.isStrongPassword(userdata.password)) {
        return res.status(400).send("Enter a strong password");
      }
    }

    const existingUser = await users.findOne({ email: userdata.email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(userdata.password, salt);
    const user = new users({
      username: userdata.username,
      email: userdata.email,
      password: hash,
    });

    const newuser = await user.save();
    const jwttoken = jwt.sign({ userId: newuser._id }, process.env.JWTSECRET);

    res.status(200).json({ email: newuser.email, jwttoken });
  } catch (error) {
    res.status(500).json("Failed to save user");
  }
};

exports.auth = async (req, res, next) => {
  const userdata = req.body;
  console.log(userdata);

  let otp = Math.floor(Math.random() * 10000);

  otp = otp.toString().padStart(4, '0');

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ghattiganesh8@gmail.com",
        pass: "kmgu ceko byxn trlz",
      },
    });

    console.log(transporter);
    const mailOptions = {
      from: "ghattiganesh8@gmail.com",
      to: "dr.srghatti@rediffmail.com",
      subject: "Hello subbu",
      text: `Your otp is ${otp}`,
    };
    console.log(mailOptions);

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error:", error.message);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(200).json({ transporter, mailOptions });
  } catch (error) {
    res.status(500).json("Failed to save user");
  }
};
