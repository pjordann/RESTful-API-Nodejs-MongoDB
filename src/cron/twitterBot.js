// Twitter bot
const { TwitterApi } = require("twitter-api-v2");
const Gasolinera = require("../models/gasolinera");

const client = new TwitterApi({
  appKey: process.env.CONSUMER_KEY,
  appSecret: process.env.CONSUMER_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
});

const rwClient = client.readWrite;

// array with every existing fuel type
const fuelTypes = [
  "precioGasoleoA",
  "precioGasoleoB",
  "precioGasoleoPremium",
  "precioGasolina95E10",
  "precioGasolina95E5",
  "precioGasolina95E5Premium",
  "precioGasolina98E10",
  "precioGasolina98E5",
];

// Promise: max price of fuelType x
var myPromiseMax = (fuelType) =>
  new Promise((resolve, reject) => {
    Gasolinera.find({ [fuelType]: { $ne: "" } })
      .sort({ [fuelType]: -1 })
      .limit(1)
      .exec(function (err, resp) {
        err;
        if (err) reject(err);
        else {
          //console.log("Max price for " + fuelType + ": " + resp[0][[fuelType]]);
          resolve(resp[0][[fuelType]]);
        }
      });
  });

// Promise: min price of fuelType x
var myPromiseMin = (fuelType) =>
  new Promise((resolve, reject) => {
    Gasolinera.find({ [fuelType]: { $ne: "" } })
      .sort({ [fuelType]: +1 })
      .limit(1)
      .exec(function (err, resp) {
        err;
        if (err) reject(err);
        else {
          //console.log("Max price for " + fuelType + ": " + resp[0][[fuelType]]);
          resolve(resp[0][[fuelType]]);
        }
      });
  });

// Promise handler.
var callMyPromise = async (i) => {
  const myArray = fuelTypes[i].split("precio");
  var result = "\n   " + myArray[1] + ": ";
  var result1 = await myPromiseMax(fuelTypes[i]);
  var result2 = await myPromiseMin(fuelTypes[i]);
  result += "🟢 " + result2 + " - 🔴 " + result1 + " €";

  return result;
};

// Where new tweets
const tweet = async () => {
  var date_format = new Date();
  // como el getMonth devuelve 0:Enero, 1:Feb ... le sumo 1.
  var mes = date_format.getMonth() + 1;
  var finalDate =
    date_format.getDate() +
    "-" +
    mes +
    "-" +
    date_format.getFullYear() +
    " a las " +
    date_format.getHours() +
    "h " +
    date_format.getMinutes() +
    "m " +
    date_format.getSeconds() +
    "s";
  var r = "⛽ PRECIOS DE LA GASOLINA (" + finalDate + ") :\n";
  try {
    for (var i = 0; i < 3; i++) {
      await callMyPromise(i).then(function (result) {
        //console.log("Paso 3-----" + result);
        r += result;
      });
    }
  } catch (err) {
    console.log(err);
  }
  try {
    await rwClient.v1.tweet(r);
    console.log("Tweet successfully created");
  } catch (e) {
    console.error(e);
  }
};

module.exports = tweet;
