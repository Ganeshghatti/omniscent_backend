const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

const connectdatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECT_URI);
  } catch (error) {
    console.log("Failed" + error.message);
  }
};
module.exports = connectdatabase;
