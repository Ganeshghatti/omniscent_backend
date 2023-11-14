const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: String,
  createdAt: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  otp: {
    type: Number,
  },
  username: String,
});

module.exports = mongoose.model("omniscent", UserSchema);
