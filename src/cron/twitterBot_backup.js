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

// get min price for fuel type
// MIN: db.gasolineras.find({"precioGasoleoB": { $ne: "" }}).sort({ precioGasoleoB: +1 }).limit(1);
function getMinPrice(fuelType) {
  Gasolinera.find({ [fuelType]: { $ne: "" } })
    .sort({ [fuelType]: +1 })
    .limit(1)
    .exec((err, resp) => {
      console.log("Min price for " + fuelType + ": " + resp[0][[fuelType]]);
    });
}

// get max price for fuel type
// MAX: db.gasolineras.find({"precioGasoleoB": { $ne: "" }}).sort({ precioGasoleoB: -1 }).limit(1);
function getMaxPrice(fuelType) {
  Gasolinera.find({ [fuelType]: { $ne: "" } })
    .sort({ [fuelType]: -1 })
    .limit(1)
    .exec((err, resp) => {
      console.log("Max price for " + fuelType + ": " + resp[0][[fuelType]]);
    });
}

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
function aux(r) {
  console.log("Last step" + r);
}

var callMyPromise = async (i) => {
  var result = "";
  var result1 = await myPromiseMax(fuelTypes[i]);
  var result2 = await myPromiseMin(fuelTypes[i]);
  var result = result1 + "/" + result2;

  return result;
};

// function that publishes new tweet
const tweet = async () => {
  var r = "";
  try {
    for (i in fuelTypes) {
      await callMyPromise(i).then(function (result) {
        console.log("Paso 3-----" + result);
      });
    }
  } catch (err) {
    console.log(err);
  }
  aux(r);
};

module.exports = tweet;

/*Gasolinera.find(
    {
      rotulo: "REPSOL",
      municipio: "Albacete",
      fecha: { $gte: lastDateOfUpdate },
    },
    (err, fuel) => {
      if (err) console.log("Error!");
      else if (!fuel) console.log("FuelStations model doesn't exist");
      return fuel;
    }
  );*/

/*const tweet = async () => {
    try {
      var resul = "⛽ PRECIOS DE LA GASOLINA:\n";
      for (i in fuelTypes) {
        // min/ max price for fuel type i
        let min = await getMinPrice(fuelTypes[i]);
        let max = await getMaxPrice(fuelTypes[i]);
        // update resul
        resul += "\n   🤩 Mínimo precio para " + fuelTypes[i] + ": " + min + " €";
        resul += "\n   🤩 Máximo precio para " + fuelTypes[i] + ": " + max + " €";
      }
      console.log(resul);
      /*await rwClient.v1.tweet(
        fuelStation +
          "\n   🤩 Min. fuel price: " +
          minPrice +
          " - [Gasolinera Sadaba]" +
          "\n   🤡 Max. fuel price: " +
          maxPrice +
          " - [Gasolinera Candilichera]"
      );
      console.log("Tweet successfully created");
    } catch (e) {
      console.error(e);
    }
  };*/
