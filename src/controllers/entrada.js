const Entrada = require("../models/entrada");
const Comentario = require("../models/comentario");
const User = require("../models/user");

// Crear nueva entrada para una gasolinera en el foro
const crearEntrada = async (req, res) => {
    const entrada = new Entrada({
        idGasolinera: req.body.idGasolinera,
        titulo: req.body.titulo,
        asunto: req.body.asunto,
        comentario: req.body.comentario,
        creadaPor: req.body.creadaPor,
        fechaCreacion: req.body.fechaCreacion
    });
    console.log(entrada)

    entrada.save((err) => {
        if (err) {
            console.log(err)
            return res.status(500).send({ message: "Error al crear la entrada" });
        } else {

            return res.status(200).send({ message: "Entrada creada" });
        }
    });
};

// Eliminar una entrada dando la posibilidad de penalizar al usuario (solo para admin)
const eliminarEntrada = async (req, res) => {
    const idEntrada = req.params.idEntrada;
    const penalizar = req.body.penalizar;
    console.log(idEntrada);
    console.log(penalizar);

    Entrada.findOneAndDelete({ _id: idEntrada }, (err, entradaEliminada) => {
        if (err) {
            return res.status(500).send({ message: err });
        } else {
            if (penalizar === true) {
                console.log(entradaEliminada.creadaPor)
                User.updateOne({ email: entradaEliminada.creadaPor }, { $inc: { penalizaciones: 1 } }, (err, resp) => {
                    if (err) return res.status(500).send({ message: err });
                    if (resp.modifiedCount != 0) {
                        Comentario.deleteMany({ idEntrada: idEntrada}, (err, comentariosEliminados) => {
                            if (err) return res.status(500).send({ message: "Entrada eliminada con penalización pero error al eliminar sus comentarios" });
                            else return res.status(200).send({ message: "Entrada eliminada con penalización y comentarios eliminados" });
                        });
                    }
                    else return res.status(400).send({ message: "Entrada eliminada pero el usuario ya no existe" });
                });
            } else {
                Comentario.deleteMany({ idEntrada: idEntrada}, (err, comentariosEliminados) => {
                    if (err) return res.status(500).send({ message: "Entrada eliminada sin penalización pero error al eliminar sus comentarios" });
                    else return res.status(200).send({ message: "Entrada eliminada sin penalización y comentarios eliminados" });
                });
            }
        }
    });
};

// Obtener todas las entradas de una gasolinera del foro
const obtenerEntradasGasolinera = async (req, res) => {
    const idGasolinera = req.params.idGasolinera;
    console.log(idGasolinera);

    Entrada.find({ idGasolinera: idGasolinera }, (err, listadoEntradas) => {
        if (err) {
            console.log(err)
            return res.status(500).send({ message: "Error al obtener entradas" });
        } else {
            console.log("Obtenidas " + listadoEntradas.length + " entradas")
            Comentario.aggregate([{ $group: { _id: { "idGasolinera": "$idGasolinera", "idEntrada": "$idEntrada" }, numComentarios: { $sum: 1 } } }], (err, listadoCount) => {
                if (err) return res.status(500).send({ message: "Error al obtener entradas de la gasolinera (numComentarios)" });
                else {
                    console.log(listadoCount)
                    Comentario.aggregate([{ $group: { _id: { "idGasolinera": "$idGasolinera", "idEntrada": "$idEntrada" }, fechaUltPub: { $max: "$fechaPublicacion" } } }], (err, listadoFechas) => {
                        if (err) return res.status(500).send({ message: "Error al obtener entradas de la gasolinera (fechaUltPub)" });
                        else {
                            console.log(listadoFechas)
                            listadoEntradas = listadoEntradas.map(function (entrada) {
                                var fechaUltPub = entrada.fechaCreacion.toLocaleString('en-GB', { timeZone: 'Europe/Madrid' });
                                var numComentarios = "0";
                                for (let i = 0; i < listadoCount.length; i++) {
                                    if (listadoCount[i]._id.idGasolinera.toString() === entrada.idGasolinera.toString() && listadoCount[i]._id.idEntrada.toString() === entrada._id.toString()) {
                                        numComentarios = listadoCount[i].numComentarios.toString();
                                    }
                                    if (listadoFechas[i]._id.idGasolinera.toString() === entrada.idGasolinera.toString() && listadoFechas[i]._id.idEntrada.toString() === entrada._id.toString()) {
                                        fechaUltPub = entrada["fechaUltPub"] = listadoFechas[i].fechaUltPub.toLocaleString('en-GB', { timeZone: 'Europe/Madrid' });
                                    }
                                }

                                entrada["fechaUltPub"] = fechaUltPub;
                                entrada["numComentarios"] = numComentarios;

                                return entrada;
                            });
                            return res.status(200).send({ listadoEntradas });
                        }
                    });
                }
            });
        }
    }).lean();
};

module.exports = {
    crearEntrada,
    eliminarEntrada,
    obtenerEntradasGasolinera
};