const axios = require("axios");
const moment = require("moment");
const nodemailer = require("nodemailer");
const express = require("express");

const sendErrorEmail = async (username, email, action) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ramakrishnan@omniscientperspectives.in",
        pass: "bfhz luxy dbio ydxv",
      },
    });

    const mailOptions = {
      from: "ramakrishnan@omniscientperspectives.in",
      to: "ramakrishnan@omniscientperspectives.in",
      subject: "Error Alert - Action Failed",
      html: `
        <p>Error alert</p>
        <p>A user named ${
          username ? username : "Username not available"
        } with email ${
        email ? email : "Email not available"
      } attempted to ${action} but failed.</p>
        <p>Message: ${
            action ? action : "No message provided"
        }</p>        
        <p>Please investigate and take necessary actions.</p>
        <p>Warm regards,</p>
        <p>Omniscient Perspectives System Notification </p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending error email:", error.message);
    return false;
  }
};

module.exports = { sendErrorEmail };
