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
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const authotp = async (email, otp, username) => {
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
      subject: "Your One-Time Password (OTP) for Signup",
      html: `
        <p>Dear ${username}</p>
        <p>Thank you for choosing Omniscient Perspectives. To proceed with your login, please use the following One-Time Password (OTP): </p>
        <h2>${otp}</h2>
        <p>Please note that this OTP is valid for only 15 minutes and for one-time use only. If you did not request this code, you can safely ignore this mail </p>
        <p>Warm regards,</p>
        <p>The Omniscient Perspectives Team </p>
      `,
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

    if (!validator.isEmail(userdata.email)) {
      return res.status(400).send({ error: "Invalid email address" });
    }
    if (!validator.isStrongPassword(userdata.password)) {
      return res.status(400).send({
        error:
          "Weak password. Must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const existingUser = await users.findOne({ email: userdata.email });

    if (existingUser) {
      return res.status(400).send({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(userdata.password, salt);

    let otp = Math.floor(1000 + Math.random() * 9000);
    otp = otp.toString().padStart(4, "0");

    const user = new users({
      username: userdata.username,
      email: userdata.email,
      password: hash,
      otp: otp,
    });

    const newUser = await user.save();

    const emailSent = await authotp(userdata.email, otp, userdata.username);
    if (!emailSent) {
      return res.status(500).send({ error: "Failed to send OTP email" });
    }

    res.status(200).json({ email: newUser.email, username: newUser.username });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send({ error: "Failed to register user" });
  }
};

exports.auth = async (req, res, next) => {
  try {
    const userdata = req.body;

    const existingUser = await users.findOne({ email: userdata.email });

    if (!existingUser) {
      return res.status(400).send({ error: "User doesn't exist" });
    }
console.log(userdata.otp, existingUser.otp)
    if (userdata.otp === existingUser.otp) {
      const jwttoken = jwt.sign(
        { userId: existingUser._id },
        process.env.JWTSECRET
      );
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "ghattiganesh8@gmail.com",
          pass: "gecy jkfr fzmy dcwf",
        },
      });

      const mailOptions = {
        from: "ghattiganesh8@gmail.com",
        to: `${userdata.email}`,
        subject: "Welcome to Omniscient Perspectives!",
        html: `
          <p>Dear ${userdata.username}</p>
          <p>Congratulations and welcome to Omniscient Perspectives! We are thrilled to have you on board. Get ready to explore and engage with our community. </p>
          <p>If you have any questions or need assistance, feel free to reach out to our support team. We're here to help!  </p>
          <p>Best wishes, </p>
          <p>The Omniscient Perspectives Team </p>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({
        email: existingUser.email,
        username: existingUser.username,
        jwttoken,
      });
    } else {
      res.status(400).send({ error: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error in authentication:", error);
    res.status(500).send({ error: "Failed to authenticate user" });
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

    res.status(200).json({
      email: existingUser.email,
      username: existingUser.username,
      token: jwttoken,
    });
  } catch (error) {
    res.status(500).send("Failed to get user");
  }
};

exports.form = async (req, res, next) => {
  try {
    const formData = req.body;

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("companyName", formData.companyName);
    formDataToSend.append("companySize", formData.companySize);
    formDataToSend.append("designation", formData.designation);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("message", formData.message);

    await axios.post(process.env.SCRIPT_URL, formDataToSend, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ghattiganesh8@gmail.com",
        pass: "gecy jkfr fzmy dcwf",
      },
    });

    const userMailOptions = {
      from: "ghattiganesh8@gmail.com",
      to: formData.email,
      subject: "Thank You for Contacting Omniscient Perspectives",
      html: `
        <p>Dear ${formData.name}</p>
        <p>We have received your submission and thank you for reaching out to us. Our team is currently reviewing your query and will get back to you as soon as possible. </p>
        <h4>Details of Your Submission:</h4>
        <p>Email: ${formData.email}</p>
        <p>Phone: ${formData.phone}</p>
        <p>Designation: ${formData.designation}</p>
        <p>Message: ${formData.message}</p>
        <p>Company Name: ${formData.companyName}</p>
        <p>Company Size: ${formData.companySize}</p>
        <p>Your interest and engagement are greatly appreciated. </p>
        <p>Warm regards,  </p>
        <p>The Omniscient Perspectives Team </p>
      `,
    };

    const adminMailOptions = {
      from: "ghattiganesh8@gmail.com",
      to: "ghattiganesh8@gmail.com",
      subject: "New User Contact Alert",
      html: `
        <p>Dear Ramakrishna,  </p>
        <p>We wanted to inform you that a new user has just filled out the contact form. Here are the details for your review and action: </p>
        <p>A duplicate of these details is also stored in your Google Sheet.</p>
        <p>User's Name : ${formData.name}</p>
        <p>Email: ${formData.email}</p>
        <p>Phone: ${formData.phone}</p>
        <p>Designation: ${formData.designation}</p>
        <p>Message: ${formData.message}</p>
        <p>Company Name: ${formData.companyName}</p>
        <p>Company Size: ${formData.companySize}</p>
        <p>Please ensure a prompt and effective response to maintain our standard of excellence. </p>
        <p>Best, </p>
        <p>Omniscient Perspectives System Notification </p>
      `,
    };

    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(adminMailOptions);

    res.status(200).send({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};
