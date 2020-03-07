const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");
const path = require("path");
const mongojs = require("mongojs");
require("dotenv").config()

const PORT =  process.env.PORT || 4000;

const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

const MONGODB_URI = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ds211259.mlab.com:11259/heroku_3zbwvbpc`
console.log(MONGODB_URI)

mongoose.connect("mongodb://localhost/budget", {
  useNewUrlParser: true,
  useFindAndModify: false
});

// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useFindAndModify: false,
//   useCreateIndex: true,
//   useUnifiedTopology: true
// });


// routes
app.use(require("./routes/api.js"));

//Set up Mongo db
const databaseUrl = process.env.MONGODB_URI || "budget";
const collections = ["budget"];

//Set database const ref
const BudgetDB = mongojs(databaseUrl, collections);
// shows error if error occurs 
 BudgetDB.on("error", error => {
  console.log("Database Error:", error);
 })

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});