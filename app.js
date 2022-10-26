const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const app = express();
const cron = require("node-cron");
const swaggerUI = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const tweet = require("./src/cron/twitterBot");
const fetchData = require("./src/cron/fetchData");

// file .env with environment variables is loaded
require("dotenv/config");

// -- documentation --
const swaggerSpec = {
  definition: {
    openapi: "3.0.18",
    info: {
      title: "NodeJS API doc",
      version: "1.0.0",
    },
    servers: [
      {
        url: "https://reloop-back.herokuapp.com/",
      },
    ],
  },
  apis: [`${path.join(__dirname, "./src/routes/*.js")}`],
};

// -- middlewares --
// when JSON is sent, API will understand it.
// API will convert it into javascript.
app.use(express.json());
app.use(
  "/api-doc",
  swaggerUI.serve,
  swaggerUI.setup(swaggerJSDoc(swaggerSpec))
);

// security measurements
var cors = require("cors");
app.use(cors());

// data could be recieved in a form-like way
// extended pretends to receive also images
app.use(express.urlencoded({ extended: true }));

// -- routes --
app.use(require("./src/routes/routes.js"));

// -- listening --
app.listen(process.env.PORT, () => {
  console.log("Server on port " + process.env.PORT);
});

// -- mongoDB database --
mongoose.connect(process.env.DB_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log(`Mongoose connected to ${process.env.DB_CONNECTION}`);
});

mongoose.connection.on("error", (err) => {
  console.log("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

// -- cron jobs --
// Fetch data from gob. page every day at 00:05
cron.schedule(
  "5 0 * * *",
  () => {
    fetchData();
  },
  {
    scheduled: true,
    timezone: "Europe/Madrid",
  }
);

// tweet data every day at 00:30 hours bruh.
cron.schedule(
  "30 0 * * *",
  () => {
    tweet();
  },
  {
    scheduled: true,
    timezone: "Europe/Madrid",
  }
);
