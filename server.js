const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

const mongojs = require("mongojs");
require("dotenv/config");
const cors = require("cors");

const PORT =  process.env.PORT || 4000;

const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));


mongoose.connect(process.env.MONGODB_URL || "mongodb://localhost/budget", {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useFindAndModify: false
});



// routes
app.use(require("./routes/api.js"));

//Set up Mongo db
const databaseUrl = process.env.MONGODB_URL || "budget";
const collections = ["budget"];

//Set database const ref
const BudgetDB = mongojs(databaseUrl, collections);
// shows error if error occurs 
 BudgetDB.on("error", error => {
  console.log("Database Error:", error);
 })


// cors origin URL - Allow inbound traffic from origin

corsOptions = {
  origin: "Your FrontEnd Website URL",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

//listening on Port $PORT
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});





