const {
  atan2,
  chain,
  derivative,
  e,
  evaluate,
  log,
  pi,
  pow,
  round,
  sqrt,
} = require("mathjs");
const Gasolinera = require("../models/gasolinera");
const Entrada = require("../models/entrada");
const Rating = require("../models/rating");

// Filtrar gasolineras
const filtrarGasolineras = async (req, res) => {
  console.log(req.query);
  const margen = req.query.margen.split(",");
  const tipoVenta = req.query.tipoVenta.split(",");
  const carburantes = req.query.tipoCarburantes.split(",");
  //const coordenadasRuta = req.query.coordenadasRuta;

  console.log(margen);
  console.log(tipoVenta);
  console.log(carburantes);
  //console.log(coordenadasRuta)

  const lastUpdate = await Gasolinera.find().sort({ fecha: -1 }).limit(1);
  console.log(lastUpdate[0].fecha);

  var query = {
    margen: { $in: margen },
    tipoVenta: { $in: tipoVenta },
    fecha: lastUpdate[0].fecha,
  };

  // Aquí cargamos en la query solo los carburantes por los que quemos filtrar
  carburantes.map(function (carburante) {
    query[carburante] = { $ne: "" };
  });

  console.log(query);

  Gasolinera.find(query, (err, listadoGasolineras) => {
    if (err) return res.status(500).send({ message: err });
    else {
      console.log("Obtenidas " + listadoGasolineras.length + " gasolineras");
      //listadoGasolineras = filtrarGasolinerasRuta(listadoGasolineras, coordenadasRuta)
      //console.log("Obtenidas " + listadoGasolineras.length + " gasolineras en la ruta")
      Rating.aggregate(
        [
          {
            $group: {
              _id: "$idGasolinera",
              media: { $avg: "$valoracion" },
              numUsers: { $sum: 1 },
            },
          },
        ],
        (err, resultRatings) => {
          if (err)
            return res
              .status(500)
              .send({ message: "Error interno al obtener gasolineras" });
          else {
            console.log(resultRatings);
            listadoGasolineras = listadoGasolineras.map(function (gasolinera) {
              var media = "0";
              var numUsers = "0";
              for (let i = 0; i < resultRatings.length; i++) {
                if (
                  resultRatings[i]._id.toString() ===
                  gasolinera.idGasolinera.toString()
                ) {
                  media = resultRatings[i].media.toString();
                  numUsers = resultRatings[i].numUsers.toString();
                }
              }

              gasolinera["valoracion"] = media;
              gasolinera["numValoraciones"] = numUsers;

              return gasolinera;
            });
            return res.status(200).send({ listadoGasolineras });
          }
        }
      );
    }
  }).lean();
};

// Obtener gasolineras con los datos necesarios para mostrarlas en el foro
const obtenerGasolinerasForo = async (req, res) => {
  const lastUpdate = await Gasolinera.find().sort({ fecha: -1 }).limit(1);
  console.log(lastUpdate[0].fecha);

  Gasolinera.find({ fecha: lastUpdate[0].fecha }, (err, listadoGasolineras) => {
    if (err)
      return res
        .status(500)
        .send({ message: "Error al obtener gasolineras del foro" });
    else {
      console.log("Obtenidas " + listadoGasolineras.length + " gasolineras");
      Entrada.aggregate(
        [{ $group: { _id: "$idGasolinera", numEntradas: { $sum: 1 } } }],
        (err, listadoCount) => {
          if (err)
            return res.status(500).send({
              message: "Error al obtener gasolineras del foro (numEntradas)",
            });
          else {
            console.log(listadoCount);
            Entrada.aggregate(
              [
                {
                  $group: {
                    _id: "$idGasolinera",
                    fechaUltPub: { $max: "$fechaCreacion" },
                  },
                },
              ],
              (err, listadoFechas) => {
                if (err)
                  return res.status(500).send({
                    message:
                      "Error al obtener gasolineras del foro (fechaUltPub)",
                  });
                else {
                  console.log(listadoFechas);
                  listadoGasolineras = listadoGasolineras.map(function (
                    gasolinera
                  ) {
                    var fechaUltPub = "";
                    var numEntradas = "0";
                    for (let i = 0; i < listadoCount.length; i++) {
                      if (
                        listadoCount[i]._id.toString() ===
                        gasolinera.idGasolinera.toString()
                      ) {
                        numEntradas = listadoCount[i].numEntradas.toString();
                      }
                      if (
                        listadoFechas[i]._id.toString() ===
                        gasolinera.idGasolinera.toString()
                      ) {
                        fechaUltPub = gasolinera["fechaUltPub"] = listadoFechas[
                          i
                        ].fechaUltPub.toLocaleString("en-GB", {
                          timeZone: "Europe/Madrid",
                        });
                      }
                    }

                    gasolinera["fechaUltPub"] = fechaUltPub;
                    gasolinera["numEntradas"] = numEntradas;

                    return gasolinera;
                  });
                  return res.status(200).send({ listadoGasolineras });
                }
              }
            );
          }
        }
      );
    }
  }).lean();
};

// Obtener gasolineras con los datos necesarios para mostrarlas en el foro. Está optimizada para que solo devuelva las gasolineras de cada página.
const obtenerGasolinerasForoOptimizado = async (req, res) => {
  const pagina = req.query.pagina;
  const numPorPag = req.query.numPorPag;
  console.log("pagina " + pagina + " con " + numPorPag);
  const lastUpdate = await Gasolinera.find().sort({ fecha: -1 }).limit(1);
  console.log(lastUpdate[0].fecha);
  const numTotalGasolineras = await Gasolinera.count({
    fecha: lastUpdate[0].fecha,
  });
  console.log(numTotalGasolineras);

  Gasolinera.find({ fecha: lastUpdate[0].fecha }, (err, listadoGasolineras) => {
    if (err)
      return res
        .status(500)
        .send({ message: "Error al obtener gasolineras del foro" });
    else {
      console.log("Obtenidas " + listadoGasolineras.length + " gasolineras");
      Entrada.aggregate(
        [{ $group: { _id: "$idGasolinera", numEntradas: { $sum: 1 } } }],
        (err, listadoCount) => {
          if (err)
            return res.status(500).send({
              message: "Error al obtener gasolineras del foro (numEntradas)",
            });
          else {
            console.log(listadoCount);
            Entrada.aggregate(
              [
                {
                  $group: {
                    _id: "$idGasolinera",
                    fechaUltPub: { $max: "$fechaCreacion" },
                  },
                },
              ],
              (err, listadoFechas) => {
                if (err)
                  return res.status(500).send({
                    message:
                      "Error al obtener gasolineras del foro (fechaUltPub)",
                  });
                else {
                  console.log(listadoFechas);
                  listadoGasolineras = listadoGasolineras.map(function (
                    gasolinera
                  ) {
                    var fechaUltPub = "";
                    var numEntradas = "0";
                    for (let i = 0; i < listadoCount.length; i++) {
                      if (
                        listadoCount[i]._id.toString() ===
                        gasolinera.idGasolinera.toString()
                      ) {
                        numEntradas = listadoCount[i].numEntradas.toString();
                      }
                      if (
                        listadoFechas[i]._id.toString() ===
                        gasolinera.idGasolinera.toString()
                      ) {
                        fechaUltPub = gasolinera["fechaUltPub"] = listadoFechas[
                          i
                        ].fechaUltPub.toLocaleString("en-GB", {
                          timeZone: "Europe/Madrid",
                        });
                      }
                    }

                    gasolinera["fechaUltPub"] = fechaUltPub;
                    gasolinera["numEntradas"] = numEntradas;

                    return gasolinera;
                  });
                  return res
                    .status(200)
                    .send({ numTotalGasolineras, listadoGasolineras });
                }
              }
            );
          }
        }
      );
    }
  })
    .skip(pagina * numPorPag)
    .limit(numPorPag)
    .lean();
};

// ADMIN. Obtains last data update (date and time)
const lastUpdateInfo = async (req, res) => {
  if (req.userr != "admin") {
    return res.sendStatus(403);
  }
  const lastUpdate = await Gasolinera.find().sort({ fecha: -1 }).limit(1);
  const fecha = lastUpdate[0].fecha;
  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  var fechaCompleta =
    fecha.getDate().toString() +
    "/" +
    meses[fecha.getMonth()] +
    "/" +
    fecha.getFullYear().toString();
  var horaCompleta =
    fecha.getHours().toString() +
    ":" +
    fecha.getMinutes().toString() +
    ":" +
    fecha.getSeconds().toString();
  return res.status(200).send({ fecha: fechaCompleta, hora: horaCompleta });
};

/*function filtrarGasolinerasRuta(listadoGasolineras, coordenadasRuta) {
    var listadoGasolinerasFiltrado = [];
    listadoGasolineras.map(function (gasolinera) {
        let punto = {
            lat: parseFloat(gasolinera.latitud.replace(",", ".")),
            lng: parseFloat(gasolinera.longitud.replace(",", "."))
        }
        try {
            coordenadasRuta.forEach(function (centro) {
                let d = sqrt(pow((punto.lat - centro.lat),2) + pow((punto.lng - centro.lng),2))
                if (d <= 0.002) { // se supone que 0.002 equivale aproximadamente a 200 metros
                    //console.log(d)
                    listadoGasolinerasFiltrado.push(gasolinera)
                    throw 'Break';
                }
            });
        } catch (e) {
            if (e !== 'Break') throw e
        }
    });

    //console.log(listadoGasolinerasFiltrado[0])
    //console.log(listadoGasolinerasFiltrado.length)

    return listadoGasolinerasFiltrado;
}*/

const preciosGasolinera = async (req, res) => {
  const idGasolineraX = req.params.idGasolinera;
  const lastUpdate = await Gasolinera.find().sort({ fecha: -1 }).limit(1);
  Gasolinera.find(
    { idGasolinera: idGasolineraX, fecha: lastUpdate[0].fecha },
    {
      precioGasoleoA: 1,
      precioGasolina95E5: 1,
      precioGasoleoPremium: 1,
      precioGasolina95E5Premium: 1,
      precioBiodiesel: 1,
    },
    (err, resultado) => {
      if (err)
        return res.status(500).send({
          message: "Error interno",
        });
      else {
        return res.status(200).send({ message: resultado });
      }
    }
  );
};

module.exports = {
  filtrarGasolineras,
  obtenerGasolinerasForo,
  obtenerGasolinerasForoOptimizado,
  lastUpdateInfo,
  preciosGasolinera,
};
