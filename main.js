const express = require("express");
const connectdatabase = require("./src/config/database");
const cors = require("cors");
const bodyParser = require("body-parser");
const userroutes = require("./src/routes/User");

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'api', '.env') });
const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

app.use(userroutes);

connectdatabase();

module.exports = app;
