/*
 * Implementación de las funciones de las rutas definidas en /routes.
 * En este caso, las del usuario.
 * https://deskevinmendez.medium.com/login-y-register-con-nodejs-express-jwt-y-mongodb-ff329ed25a3f
 */

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const winston = require("winston");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);
const { combine, timestamp, align, printf } = winston.format;
const saltRounds = 10;
const User = require("../models/user");
const DeletedUser = require("../models/deletedUsers");

//logging with winston
const logger = winston.createLogger({
  format: combine(
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}:\t ${info.message}`)
  ),
  transports: [
    new winston.transports.File({
      filename: "logs/UsersLog.log",
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/UsersLog.log" }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: "logs/UsersLog.log" }),
  ],
});

// login
const login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // si no me pasan valores o no son strings...
  if (
    email == undefined ||
    password == undefined ||
    typeof email != "string" ||
    typeof password != "string"
  ) {
    return res.status(400).send({ message: "Invalid values" });
  }

  User.findOne({ email }, (err, retrievedUser) => {
    if (err) {
      logger.error("Error en BD -> /login");
      return res.status(500).send({ message: err });
    }
    if (!retrievedUser)
      return res.status(400).send({ message: "User not registered" });
    else {
      // user with 'email' exists. Let´s prove pw is correct.
      if (!bcrypt.compareSync(password, retrievedUser.password)) {
        return res.status(400).json({
          message: "Password is incorrect",
        });
      }
      // everything OK. jwt is generated.
      const accessToken = jwt.sign(
        { username: email, id: retrievedUser._id },
        process.env.TOKEN_KEY,
        {
          expiresIn: 60 * 60 * 24, // 24 h
        }
      );
      return res
        .status(200)
        .send({ token: accessToken, id: retrievedUser._id });
    }
  });
};

// signin
const signin = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // si no me pasan valores o no son strings...
  if (
    email == undefined ||
    password == undefined ||
    typeof email != "string" ||
    typeof password != "string"
  ) {
    return res.status(400).send({ message: "Invalid values" });
  }
  const user = new User({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, saltRounds),
  });

  user.save((err, doc) => {
    if (err) {
      logger.error("Error en BD -> /signin");
      return res.status(400).send({
        message: "Error. User already created with that name",
      });
    }

    const accessToken = jwt.sign(
      { username: req.body.email, id: doc._id },
      process.env.TOKEN_KEY,
      {
        expiresIn: 60 * 60 * 24, // 24 h
      }
    );
    return res.status(200).send({ token: accessToken, id: doc._id });
  });
};

// delete account
const deleteNuevo = async (req, res) => {
  const userMotivo = req.body.motivo;
  // si no me pasan valores o no son strings...
  if (userMotivo == undefined || typeof userMotivo != "string") {
    return res.status(400).send({ message: "Invalid values" });
  }
  const userToBeDeleted = req.params.id;
  User.findOne({ _id: userToBeDeleted }, (err, retrievedUser) => {
    if (err) {
      logger.error("Error en BD -> User.findOne en /deleteNuevo");
      return res.status(500).send({ message: err });
    }
    if (!retrievedUser)
      return res.status(400).send({ message: "User not registered" });
    else {
      User.deleteOne({ _id: userToBeDeleted }, (err, resp) => {
        if (err) {
          logger.error("Error en BD -> User.deleteOne en /deleteNuevo");
          return res.status(500).send({ message: err });
        }
        if (resp.deletedCount != 0) {
          const arrayMotivos = userMotivo.split(",");
          for (var i = 0; i < arrayMotivos.length; i++) {
            const deletedUser = new DeletedUser({
              email: retrievedUser.email,
              motivo: parseInt(arrayMotivos[i]),
            });
            deletedUser.save();
          }
          return res.status(200).send({ message: "User deleted successfully" });
        } else return res.status(500).send({ message: "Unexpected error" });
      });
    }
  });
};

// change user's password
const cambiarContrasenyaNuevo = async (req, res) => {
  const newPassword = req.body.password;
  // si no me pasan valores o no son strings...
  if (newPassword == undefined || typeof newPassword != "string") {
    return res.status(400).send({ message: "Invalid values" });
  }

  const userId = req.params.id;
  User.findOne({ _id: userId }, (err, retrievedUser) => {
    if (err) {
      logger.error("Error en BD -> User.findOne en /cambiarContrasenyaNuevo");
      return res.status(500).send({ message: err });
    }
    if (!retrievedUser)
      return res.status(400).send({ message: "User not registered" });
    else {
      User.updateOne(
        { _id: userId },
        { password: bcrypt.hashSync(newPassword, saltRounds) },
        (err) => {
          if (err) {
            logger.error(
              "Error en BD -> User.updateOne en /cambiarContrasenyaNuevo"
            );
            return res.status(500).send({ message: err });
          } else
            return res
              .status(200)
              .send({ message: "Password changed sucessfully" });
        }
      );
    }
  });
};

// change user's mail
const cambiarCorreoNuevo = async (req, res) => {
  const newMail = req.body.mail;
  // si no me pasan valores o no son strings...
  if (newMail == undefined || typeof newMail != "string") {
    return res.status(400).send({ message: "Invalid values" });
  }
  const userId = req.params.id;
  User.findOne({ _id: userId }, (err, retrievedUser) => {
    if (err) {
      logger.error("Error en BD -> User.findOne en /cambiarCorreoNuevo");
      return res.status(500).send({ message: err });
    }
    if (!retrievedUser)
      return res.status(400).send({ message: "User not registered" });
    else {
      User.updateOne({ _id: userId }, { email: newMail }, (err) => {
        if (err) {
          logger.error("Error en BD -> User.updateOne en /cambiarCorreoNuevo");
          return res.status(500).send({ message: err });
        } else
          return res.status(200).send({ message: "Mail changed sucessfully" });
      });
    }
  });
};

// ADMIN. penalize
const penalizarNuevo = async (req, res) => {
  if (req.userr != "admin") {
    return res.sendStatus(403);
  } else {
    const userId = req.params.id;
    User.findOne({ _id: userId }, (err, retrievedUser) => {
      if (err) {
        logger.error("Error en BD -> User.findOne en /penalizarNuevo");
        return res.status(500).send({ message: err });
      }
      if (!retrievedUser)
        return res.status(400).send({ message: "User not registered" });
      else {
        User.updateOne(
          { _id: userId },
          {
            $inc: {
              penalizaciones: 1,
            },
          },
          (err) => {
            if (err) {
              logger.error("Error en BD -> User.updateOne en /penalizarNuevo");
              return res.status(500).send({ message: err });
            } else
              return res
                .status(200)
                .send({ message: "Penalizacion registrada" });
          }
        );
      }
    });
  }
};

// ADMIN. obtains user's penalizations
const obtenerPenalizaciones = async (req, res) => {
  var filter = req.query.filter;
  // si no me pasan el valor o no es un string (asc/desc)...
  if (filter == undefined || (filter != "asc" && filter != "desc")) {
    return res
      .status(400)
      .send({ message: "Valor no válido para el filtro (asc/desc)" });
  }
  if (req.userr != "admin") {
    return res.sendStatus(403);
  } else {
    // get filter type (asc or desc)
    const filtro = req.query.filter;
    console.log("FILTROOO " + req.query.filter + ".");
    User.find(
      { email: { $ne: "admin" } },
      { email: 1, penalizaciones: 1, signupDate: 1 }
    )
      .sort({ penalizaciones: filtro })
      .exec(function (err, groupRes) {
        if (err) {
          logger.error("Error en BD -> User.find en /obtenerPenalizaciones");
          return res.status(500).send({ message: err });
        } else res.status(200).send({ message: groupRes });
      });
  }
};

// ADMIN. obtains reason of deletion and number of users
const numUsersPorMotivo = async (req, res) => {
  if (req.userr != "admin") {
    return res.sendStatus(403);
  } else {
    DeletedUser.aggregate(
      [
        {
          $group: {
            _id: "$motivo",
            numUsers: { $sum: 1 },
          },
        },
      ],
      (err, resultado) => {
        if (err) {
          logger.error(
            "Error en BD -> DeletedUser.aggregate en /numUsersPorMotivo"
          );
          return res.status(500).send({ message: err });
        } else res.status(200).send({ message: resultado });
      }
    );
  }
};

// ADMIN. total registered users.
const totalUsuarios = async (req, res) => {
  if (req.userr != "admin") {
    return res.sendStatus(403);
  }
  User.find({ email: { $ne: "admin" } }).count((err, result) => {
    if (err) {
      logger.error("Error en BD -> User.find en /totalUsuarios");
      return res.status(500).send({ message: err });
    }
    return res.status(200).send({ total: result });
  });
};

// ADMIN. new users (signed up) by date (last 30 days)
// no se hace filtro de últimos 30 días ya que nuestro registro más antiguo es del 30 de Abril
const nuevosUsuarios = async (req, res) => {
  if (req.userr != "admin") {
    return res.sendStatus(403);
  }
  User.aggregate(
    [
      {
        $group: {
          _id: {
            month: { $month: "$signupDate" },
            day: { $dayOfMonth: "$signupDate" },
            year: { $year: "$signupDate" },
          },
          newUsers: { $sum: 1 },
        },
      },
    ],
    (err, resultado) => {
      if (err) {
        logger.error("Error en BD -> User.aggregate en /nuevosUsuarios");
        return res.status(500).send({ message: err });
      }
      return res.status(200).send({ message: resultado });
    }
  );
};

// login with google
const loginGoogle = async (req, res) => {
  const { token } = req.body;
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID,
  });
  const { email } = ticket.getPayload();
  var emailUser = email;
  console.log(emailUser);
  User.findOne({ email: emailUser }, (err, retrievedUser) => {
    if (err) {
      logger.error("Error en BD -> /loginGoogle");
      return res.status(500).send({ message: err });
    }
    if (!retrievedUser) {
      // lo metemos en BD
      const user = new User({
        email: emailUser,
        password: "********",
      });
      user.save((err, doc) => {
        if (err) {
          logger.error("Error en BD -> /loginGoogle");
          return res.status(500).send({ message: err });
        }
        const accessToken = jwt.sign(
          { username: emailUser, id: doc._id },
          process.env.TOKEN_KEY,
          {
            expiresIn: 60 * 60 * 24, // 24 h
          }
        );
        console.log("no estaba en bd");
        return res.status(200).send({ token: accessToken, id: doc._id });
      });
    } else {
      console.log(retrievedUser);
      // user exists in db
      const accessToken = jwt.sign(
        { username: emailUser, id: retrievedUser._id },
        process.env.TOKEN_KEY,
        {
          expiresIn: 60 * 60 * 24, // 24 h
        }
      );
      console.log("ya estaba en bd");
      return res
        .status(200)
        .send({ token: accessToken, id: retrievedUser._id });
    }
  });
};
module.exports = {
  login,
  signin,
  deleteNuevo,
  cambiarContrasenyaNuevo,
  cambiarCorreoNuevo,
  penalizarNuevo,
  obtenerPenalizaciones,
  numUsersPorMotivo,
  totalUsuarios,
  nuevosUsuarios,
  loginGoogle,
};
