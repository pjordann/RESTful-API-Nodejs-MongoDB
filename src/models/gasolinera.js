/*
 * Modelo de datos en MongoDB de una gasolinera.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gasolineraSchema = new Schema({
  idGasolinera: {
    type: String,
    required: true,
  },
  codigoPostal: {
    type: String,
    required: false,
  },
  direccion: {
    type: String,
    required: false,
  },
  horario: {
    type: String,
    required: false,
  },
  latitud: {
    type: String,
    required: false,
  },
  longitud: {
    type: String,
    required: false,
  },
  localidad: {
    type: String,
    required: false,
  },
  municipio: {
    type: String,
    required: false,
  },
  provincia: {
    type: String,
    required: false,
  },
  remision: {
    type: String,
    required: false,
  },
  rotulo: {
    type: String,
    trim: true,
    required: false,
  },
  tipoVenta: {
    type: String,
    required: false,
  },
  margen: {
    type: String,
    required: false,
  },
  precioBiodiesel: {
    type: String,
    required: false,
  },
  precioBioetanol: {
    type: String,
    required: false,
  },
  precioGasNaturalComprimido: {
    type: String,
    required: false,
  },
  precioGasNaturalLicuado: {
    type: String,
    required: false,
  },
  precioGasesLicuadosDelPetroleo: {
    type: String,
    required: false,
  },
  precioGasoleoA: {
    type: String,
    required: false,
  },
  precioGasoleoB: {
    type: String,
    required: false,
  },
  precioGasoleoPremium: {
    type: String,
    required: false,
  },
  precioGasolina95E10: {
    type: String,
    required: false,
  },
  precioGasolina95E5: {
    type: String,
    required: false,
  },
  precioGasolina95E5Premium: {
    type: String,
    required: false,
  },
  precioGasolina98E10: {
    type: String,
    required: false,
  },
  precioGasolina98E5: {
    type: String,
    required: false,
  },
  precioHidrogeno: {
    type: String,
    required: false,
  },
  porcentajeBioetanol: {
    type: String,
    required: false,
  },
  porcentajeEsterMetilico: {
    type: String,
    required: false,
  },
  fecha: {
    type: Date,
    default: Date.now(),
    required: true,
  },
});

module.exports = mongoose.model("Gasolinera", gasolineraSchema);
