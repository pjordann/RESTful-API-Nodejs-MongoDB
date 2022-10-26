const Comentario = require("../models/comentario");
const User = require("../models/user");

// Publica un nuevo comentario para una entrada en el foro
const publicarComentario = async (req, res) => {
    const comentario = new Comentario({
        idGasolinera: req.body.idGasolinera,
        idEntrada: req.body.idEntrada,
        comentario: req.body.comentario,
        publicadoPor: req.body.publicadoPor,
        fechaPublicacion: req.body.fechaPublicacion
    });
    console.log(comentario)

    comentario.save((err) => {
        if (err) {
            console.log(err)
            return res.status(500).send({ message: "Error al publicar el comentario" });
        } else {

            return res.status(200).send({ message: "Comentario publicado" });
        }
    });
};

// Eliminar un comentario dando la posibilidad de penalizar al usuario (solo para admin)
const eliminarComentario = async (req, res) => {
    const idComentario = req.params.idComentario;
    const penalizar = req.body.penalizar;
    console.log(idComentario);
    console.log(penalizar);

    Comentario.findOneAndDelete({ _id: idComentario }, (err, comentarioEliminado) => {
        if (err) {
            return res.status(500).send({ message: err });
        } else {
            console.log(comentarioEliminado)
            if (penalizar === true) {
                User.updateOne({ email: comentarioEliminado.publicadoPor }, { $inc: { penalizaciones: 1 } }, (err, resp) => {
                    if (err) return res.status(500).send({ message: err });
                    if (resp.modifiedCount != 0) return res.status(200).send({ message: "Comentario eliminado con penalización" });
                    else return res.status(400).send({ message: "Comentario eliminado pero el usuario ya no existe" });
                });
            } else {
                return res.status(200).send({ message: "Comentario eliminado sin penalización" });
            }
        }
    });
};

// Obtener todos los comentarios de una entrada del foro
const obtenerComentariosEntrada = async (req, res) => {
    const idGasolinera = req.params.idGasolinera;
    const idEntrada = req.params.idEntrada;
    console.log(idGasolinera);
    console.log(idEntrada);

    Comentario.find({ idGasolinera: idGasolinera, idEntrada: idEntrada }, (err, listadoComentarios) => {
        if (err) {
            console.log(err)
            return res.status(500).send({ message: "Error al obtener comentarios" });
        } else {
            console.log("Obtenidos " + listadoComentarios.length + " comentarios")
            return res.status(200).send({ listadoComentarios });
        }
    });
};

// ADMIN. new comments by date (last 30 days)
// no se hace filtro de últimos 30 días ya que nuestro registro más antiguo es del 30 de Abril
const nuevosComentarios = async (req, res) => {
    if (req.userr != "admin") {
      return res.sendStatus(403);
    }
    Comentario.aggregate(
      [
        {
          $group: {
            _id: {
              month: { $month: "$fechaPublicacion" },
              day: { $dayOfMonth: "$fechaPublicacion" },
              year: { $year: "$fechaPublicacion" },
            },
            newComments: { $sum: 1 },
          },
        },
      ],
      (err, resultado) => {
        if (err) {
          logger.error("Error en BD -> Comentario.aggregate en /nuevosComentarios");
          return res.status(500).send({ message: err });
        }
        return res.status(200).send({ message: resultado });
      }
    );
  };

module.exports = {
    publicarComentario,
    eliminarComentario,
    obtenerComentariosEntrada,
    nuevosComentarios
};