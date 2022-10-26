/*
 * Modelo de datos en MongoDB de una entrada del foro.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const entradaSchema = new Schema({
  idGasolinera: {
    type: String,
    required: true,
  },
  titulo: {
    type: String,
    required: true,
  },
  asunto: {
    type: String,
    required: true,
  },
  comentario: {
    type: String,
    required: true,
  },
  creadaPor: {
    type: String,
    required: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now(),
    required: true,
  },
});

module.exports = mongoose.model("Entrada", entradaSchema);