/*
 * Modelo de datos en MongoDB de un comentario en el foro.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const comentarioSchema = new Schema({
  idGasolinera: {
    type: String,
    required: true,
  },
  idEntrada: {
    type: String,
    required: true,
  },
  comentario: {
    type: String,
    required: true,
  },
  publicadoPor: {
    type: String,
    required: true,
  },
  fechaPublicacion: {
    type: Date,
    default: Date.now(),
    required: true,
  },
});

module.exports = mongoose.model("Comentario", comentarioSchema);
