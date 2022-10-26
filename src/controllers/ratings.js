/*
 * Implementación de las funciones de las rutas definidas en /routes.
 * En este caso, las de valoraciones.
 */

const Rating = require("../models/rating");
const Gasolineras = require("../models/gasolinera");

const anyadirRating = async (req, res) => {
  // OJO! el usuario lo cogemos del token.
  const _idGasolienera = req.params.idGasolinera;
  const _valoracion = req.body.valoracion;
  console.log(_idGasolienera);
  console.log(_valoracion);
  console.log(req.userr);
  if (
    _idGasolienera == undefined ||
    typeof _idGasolienera != "string" ||
    isNaN(_idGasolienera) ||
    _valoracion == undefined ||
    typeof _valoracion != "number"
  ) {
    return res.status(400).send({ message: "Invalid values" });
  }
  const rating = new Rating({
    idGasolinera: _idGasolienera,
    usuario: req.userr,
    valoracion: _valoracion,
  });

  rating.save((err) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ message: "Error al valorar" });
    } else {
      return res.status(200).send({ message: "Rating realizado con éxito" });
    }
  });
};

// devolver: nombreGasolinera, municipio, valoracion (media), numero de usuarios que han votado,
// codigo postal.
const obtenerGasolinerasRating = async (req, res) => {
  const lastUpdate = await Gasolineras.find().sort({ fecha: -1 }).limit(1);
  console.log(lastUpdate[0].fecha);

  Gasolineras.find(
    { fecha: lastUpdate[0].fecha },
    {
      idGasolinera: 1,
      rotulo: 1,
      provincia: 1,
      codigoPostal: 1,
      precioGasoleoPremium: 1,
      precioGasolina95E5: 1,
      precioGasolina95E5Premium: 1,
      precioGasoleoA: 1,
      precioGasoleoB: 1,
    },
    (err, listadoGasolineras) => {
      if (err)
        return res
          .status(500)
          .send({ message: "Error al obtener gasolineras del rating" });
      else {
        console.log("Obtenidas " + listadoGasolineras.length + " gasolineras");
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
              return res.status(500).send({
                message: "Error interno al obtener gasolinerasRating",
              });
            else {
              console.log(resultRatings);
              listadoGasolineras = listadoGasolineras.map(function (
                gasolinera
              ) {
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

                gasolinera["media"] = media;
                gasolinera["numUsers"] = numUsers;

                return gasolinera;
              });
              return res.status(200).send({ listadoGasolineras });
            }
          }
        );
      }
    }
  ).lean();
};

function descMedia(a, b) {
  if (a.media > b.media) return -1;
  if (a.media < b.media) return 1;
  return 0;
}

function ascMedia(a, b) {
  if (a.media > b.media) return 1;
  if (a.media < b.media) return -1;
  return 0;
}

var descNumUsers = function numUsersVotado(a, b) {
  if (a.numUsers > b.numUsers) return -1;
  if (a.numUsers < b.numUsers) return 1;
  return 0;
};

const obtenerGasolinerasRatingPaginado = async (req, res) => {
  const pagina = req.query.pagina;
  const numPorPag = req.query.numPorPag;
  console.log("pagina " + pagina + " con " + numPorPag);
  const lastUpdate = await Gasolineras.find().sort({ fecha: -1 }).limit(1);
  console.log(lastUpdate[0].fecha);
  const numTotalGasolineras = await Gasolineras.count({
    fecha: lastUpdate[0].fecha,
  });
  console.log(numTotalGasolineras);

  var ordenacion;
  if (req.query.filter == "alf") ordenacion = { sort: { rotulo: "asc" } };
  Gasolineras.find(
    { fecha: lastUpdate[0].fecha },
    {
      idGasolinera: 1,
      rotulo: 1,
      provincia: 1,
      codigoPostal: 1,
      precioGasoleoPremium: 1,
      precioGasolina95E5: 1,
      precioGasolina95E5Premium: 1,
      precioGasoleoA: 1,
      precioGasoleoB: 1,
    },
    ordenacion,
    (err, listadoGasolineras) => {
      if (err)
        return res
          .status(500)
          .send({ message: "Error al obtener gasolineras del rating" });
      else {
        console.log("Obtenidas " + listadoGasolineras.length + " gasolineras");
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
              return res.status(500).send({
                message: "Error interno al obtener gasolinerasRating",
              });
            else {
              console.log(resultRatings);
              var orden;
              if (req.query.filter == "asc") orden = ascMedia;
              if (req.query.filter == "desc") orden = descMedia;
              if (req.query.filter == "numVotos") orden = descNumUsers;
              listadoGasolineras = listadoGasolineras
                .map(function (gasolinera) {
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

                  gasolinera["media"] = media;
                  gasolinera["numUsers"] = numUsers;

                  return gasolinera;
                })
                .sort(orden)
                .slice(
                  parseInt(pagina, 10) * parseInt(numPorPag, 10),
                  parseInt(pagina, 10) * parseInt(numPorPag, 10) +
                    parseInt(numPorPag, 10)
                );

              return res
                .status(200)
                .send({ numTotalGasolineras, listadoGasolineras });
            }
          }
        );
      }
    }
  )
    //.skip(pagina * numPorPag)
    //.limit(numPorPag)
    .lean();
};

module.exports = {
  anyadirRating,
  obtenerGasolinerasRating,
  obtenerGasolinerasRatingPaginado,
};
