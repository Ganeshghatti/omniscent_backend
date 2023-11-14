const express = require("express");
const connectdatabase = require("./config/database");
const cors = require("cors");
const bodyParser = require("body-parser");
const userroutes = require("./routes/User");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(userroutes);

connectdatabase();
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
