/*
 * Modelo de datos en MongoDB de una valoración.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
  idGasolinera: {
    type: String,
    required: true,
  },
  usuario: {
    type: String,
    required: true,
  },
  valoracion: {
    type: Number,
    required: true,
  },
  fechaRating: {
    type: Date,
    default: Date.now(),
    required: false,
  },
});

module.exports = mongoose.model("Rating", ratingSchema);
