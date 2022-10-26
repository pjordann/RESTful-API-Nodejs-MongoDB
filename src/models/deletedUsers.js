/*
 * Modelo de datos en MongoDB de usuarios eliminados y motivos.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const deletedUserSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  motivo: {
    type: Number,
    required: true,
  },
  removalDate: {
    type: Date,
    default: Date.now(),
    required: false,
  },
});

module.exports = mongoose.model("DeletedUser", deletedUserSchema);
