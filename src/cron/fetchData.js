const Gasolinera = require("../models/gasolinera");
const axios = require("axios");
// URI from which data is fetched
const gob_URL =
  "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/";

// Fucntion that does so.
async function fetchData() {
  try {
    const response = await axios.get(gob_URL);
    const fecha = response.data.Fecha.toString().split(" ")[0].split("/").reverse().toString().replace(/,/g,"/") + " " + response.data.Fecha.split(" ")[1];
    response.data.ListaEESSPrecio.map(function (gasolineraItem) {
      var gasolinera = new Gasolinera({
        idGasolinera: gasolineraItem["IDEESS"],
        codigoPostal: gasolineraItem["C.P."],
        direccion: gasolineraItem["Dirección"],
        horario: gasolineraItem["Horario"],
        latitud: gasolineraItem["Latitud"],
        longitud: gasolineraItem["Longitud (WGS84)"],
        localidad: gasolineraItem["Localidad"],
        municipio: gasolineraItem["Municipio"],
        provincia: gasolineraItem["Provincia"],
        remision: gasolineraItem["Remisión"],
        rotulo: gasolineraItem["Rótulo"],
        tipoVenta: gasolineraItem["Tipo Venta"],
        margen: gasolineraItem["Margen"],
        precioBiodiesel: gasolineraItem["Precio Biodiesel"],
        precioBioetanol: gasolineraItem["Precio Bioetanol"],
        precioGasNaturalComprimido:
        gasolineraItem["Precio Gas Natural Comprimido"],
        precioGasNaturalLicuado: gasolineraItem["Precio Gas Natural Licuado"],
        precioGasesLicuadosDelPetroleo:
        gasolineraItem["Precio Gases licuados del petróleo"],
        precioGasoleoA: gasolineraItem["Precio Gasoleo A"],
        precioGasoleoB: gasolineraItem["Precio Gasoleo B"],
        precioGasoleoPremium: gasolineraItem["Precio Gasoleo Premium"],
        precioGasolina95E10: gasolineraItem["Precio Gasolina 95 E10"],
        precioGasolina95E5: gasolineraItem["Precio Gasolina 95 E5"],
        precioGasolina95E5Premium:
        gasolineraItem["Precio Gasolina 95 E5 Premium"],
        precioGasolina98E10: gasolineraItem["Precio Gasolina 98 E10"],
        precioGasolina98E5: gasolineraItem["Precio Gasolina 98 E5"],
        precioHidrogeno: gasolineraItem["Precio Hidrogeno"],
        porcentajeBioetanol: gasolineraItem["0,0"],
        porcentajeEsterMetilico: gasolineraItem["0,0"],
        fecha: new Date(fecha),
      });
      gasolinera.save((err) => {
        if (err) {
          console.log(err);
        }
      });
    });
    console.log(
      "Información de gasolineras actualizada: " +
        new Date(fecha).toLocaleString({
          timeZone: "Europe/Madrid",
        })
    );
  } catch (error) {
    console.error(error);
  }
}

module.exports = fetchData;
