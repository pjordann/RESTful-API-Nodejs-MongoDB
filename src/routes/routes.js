/*
 * Rutas de nuestra aplicación web. La implementación de las funciones
 * se encuentra en /controllers.
 */

const { Router } = require("express");
const router = Router();
const userController = require("../controllers/user");
const gasolineraController = require("../controllers/gasolinera");
const entradaController = require("../controllers/entrada");
const comentarioController = require("../controllers/comentario");
const ratingsController = require("../controllers/ratings");
const axios = require("axios");
// jwt
const jwt = require("jsonwebtoken");

// -- middleware --
// if jwt is sent in request --> OK
// but if jwt is not sent or incorrect --> NOT OK
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    //quito lo de Bearer, palabra que se pone automáticamente en las peticiones HTTP
    const token = authHeader.split(" ")[1];
    //verify if sent token is valid
    jwt.verify(token, process.env.TOKEN_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      //leave in req.user the user's username.
      req.userr = user.username;
      req.userId = user.id;
      next();
    });
  } else {
    // no authHeader -> no authentication
    res.sendStatus(401);
  }
};

//home page
router.get("/", (req, res) => {
  console.log("Petición a la página de inicio");
  res.send("API running...");
});

// test route
router.get("/test", auth, (req, res) => {
  console.log("Authorized. Username: " + req.userr);
  res.send("Authorized. Username: " + req.userr);
});

// User's schema
/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      properties:
 *        email:
 *          type: string
 *          description: user's email
 *        password:
 *          type: string
 *          description: user's password
 *      required:
 *        - email
 *        - password
 *      example:
 *        email: example@gmail.com
 *        password: iamexample1234
 *    Penalizaciones:
 *      type: object
 *      example:
 *        email: "example@gmail.com"
 *        penalizaciones: 3
 *    Motivos:
 *      type: object
 *      example:
 *        motivo: 1
 *        numUsers: 12
 *    Gasolinera:
 *      type: object
 *      example:
 *        idGasolinera: "5122"
 *        codigoPostal: "02152"
 *        direccion: "CR CM-332, 46,4"
 *        horario: "L-D: 7:00-23:00"
 *        latitud: "39,100389"
 *        longitud: "-1,346083"
 *        localidad: "ALATOZ"
 *        municipio: "Alatoz"
 *        provincia: "ALBACETE"
 *        remision: "dm"
 *        rotulo: "REPSOL"
 *        tipoVenta: "P"
 *        margen: "I"
 *        precioBiodiesel: ""
 *        precioBioetanol: ""
 *        precioGasNaturalComprimido: ""
 *        precioGasNaturalLicuado: ""
 *        precioGasesLicuadosDelPetroleo: ""
 *        precioGasoleoA: "1,890"
 *        precioGasoleoB: ""
 *        precioGasoleoPremium: "2,000"
 *        precioGasolina95E10: ""
 *        precioGasolina95E5: "1,849"
 *        precioGasolina95E5Premium: ""
 *        precioGasolina98E10: ""
 *        precioGasolina98E5: "2,000"
 *        precioHidrogeno: ""
 *        fecha: "2022-04-29T00:05:00.000Z"
 *        fechaUltPub: "18/4/2022, 15:15:21"
 *        numEntradas: "3"
 *    Rating:
 *      type: object
 *      properties:
 *        valoracion:
 *          type: integer
 *          description: user's mark for specified gas station
 *      required:
 *        - valoracion
 *      example:
 *        valoracion: 3
 *    Entrada:
 *      type: object
 *      properties:
 *        idGasolinera:
 *          type: string
 *          description: unique id for gas station
 *        titulo:
 *          type: string
 *          description: title of entry
 *        asunto:
 *          type: string
 *          description: subject of entry
 *        comentario:
 *          type: string
 *          description: first comment that is shown
 *        creadaPor:
 *          type: string
 *          description: user who created it
 *        fechaCreacion:
 *          type: string
 *          description: date of creation
 *        fechaUltPub:
 *          type: string
 *          description: date of last publication
 *        numComentarios:
 *          type: string
 *          description: number of comments
 *      example:
 *        idGasolinera: 5122
 *        titulo: Instalaciones
 *        asunto: Instalaciones de la gasolinera (baños)
 *        comentario: Son una pocilga. Dan pena. Se me fueron las ganas de plantar el pino.
 *        creadaPor: Jose Luis Perez
 *        fechaCreacion: 2022-04-17T13:11:07.920Z
 *        fechaUltPub: 2022-04-25T13:11:07.920Z
 *        numComentarios: 14
 *    GasolinerasRating:
 *      type: object
 *      properties:
 *        idGasolinera:
 *          type: string
 *          description: unique id for gas station
 *        codigoPostal:
 *          type: string
 *          description: gas station´s post code
 *        municipio:
 *          type: string
 *          description: gas station´s site
 *        rotulo:
 *          type: string
 *          description: gas station´s name
 *        media:
 *          type: string
 *          description: gas station´s average mark
 *        numUsers:
 *          type: integer
 *          description: number of user who voted
 *      example:
 *        idGasolinera: "5112"
 *        codigoPostal: "02250"
 *        municipio: Abengibre
 *        rotulo: Nº 10.935
 *        media: 2.3335
 *        numUsers: 21
 *    Foro:
 *      type: object
 *      properties:
 *        idGasolinera:
 *          type: string
 *          description: unique id for gas station
 *        idEntrada:
 *          type: string
 *          description: gas station's entry id
 *        comentario:
 *          type: string
 *          description: commentary
 *        publicadoPor:
 *          type: string
 *          description: user who published the commentary
 *        fechaPublicacion:
 *          type: date
 *          description: date the commentary was published
 *      example:
 *        idGasolinera: "5112"
 *        idEntrada: "625c11ec660a09080965b2b6"
 *        comentario: siuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu
 *        publicadoPor: Joao Felix
 *        fechaPublicacion: 2022-04-17T19:55:05.448Z
 *  responses:
 *    UnauthorizedError:
 *      description: Access token is missing
 *    NotValidError:
 *      description: Access token is invalid
 *  securitySchemes:
 *    bearerAuth:
 *      type: http
 *      scheme: bearer
 */

// login
/**
 * @swagger
 * /users/login:
 *  post:
 *    summary: Logs new user
 *    tags: [User]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      200:
 *        description: User successfully logged in
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *                  description: User's token for following api calls
 *                id:
 *                  type: string
 *                  description: User's id for future api calls
 *              example:
 *                token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImV4YW1wbGVAZ21haWwuY29tIiwiaWF0IjoxNjUwNTYzMjQ5LCJleHAiOjE2NTA2NDk2NDl9.f1NcFQ-TIPRbHbdPDJNRnpuqBS2uEpvrJjrElbMW-RQ
 *                id: 62795e42312401ed8495e677
 *      400:
 *        description: User cannot be logged in (user not registered or incorret pw).
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: error message
 *              example:
 *                message: Password is incorrect
 *      500:
 *        description: Internal server error.
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: server's error message
 */
router.post("/users/login", userController.login);

// login with google
/**
 * @swagger
 * /users/login/google:
 *  post:
 *    summary: Logs new user with Google
 *    tags: [User]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              token:
 *                type: string
 *                description: user's google token
 *            required:
 *              - token
 *            example:
 *              token: "eyJa4139sh73r..."
 *    responses:
 *      200:
 *        description: User successfully logged in
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *                  description: User's token for following api calls
 *                id:
 *                  type: string
 *                  description: User's id for future api calls
 *              example:
 *                token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImV4YW1wbGVAZ21haWwuY29tIiwiaWF0IjoxNjUwNTYzMjQ5LCJleHAiOjE2NTA2NDk2NDl9.f1NcFQ-TIPRbHbdPDJNRnpuqBS2uEpvrJjrElbMW-RQ
 *                id: 62795e42312401ed8495e677
 *      500:
 *        description: Internal server error.
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: server's error message
 */
router.post("/users/login/google", userController.loginGoogle);

// signin
/**
 * @swagger
 * /users/signin:
 *  post:
 *    summary: Signs in new user
 *    tags: [User]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      200:
 *        description: User successfully signed in
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *                  description: User's token for following api calls
 *                id:
 *                  type: string
 *                  description: User's id for future calls
 *              example:
 *                token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImV4YW1wbGVAZ21haWwuY29tIiwiaWF0IjoxNjUwNTYzMjQ5LCJleHAiOjE2NTA2NDk2NDl9.f1NcFQ-TIPRbHbdPDJNRnpuqBS2uEpvrJjrElbMW-RQ
 *                id: 62795e42312401ed8495e677
 *      400:
 *        description: User cannot be signed in (already exists created user with that name).
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: error message
 *              example:
 *                message: Error. User already created with that name
 */
router.post("/users/signin", userController.signin);

// delete account
/**
 * @swagger
 * /users/{id}:
 *  delete:
 *    summary: Deletes existing user
 *    tags: [User]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: integer
 *        description: User's ID to be deleted.
 *        example: 62795e42312401ed8495e677
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              motivo:
 *                type: string
 *                description: user's reasons to delete account
 *            required:
 *              - motivo
 *            example:
 *              motivo: "1,2,5"
 *    responses:
 *      200:
 *        description: User deleted successfully
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: success message
 *              example:
 *                message: User deleted successfully
 *      400:
 *        description: User not registered/Invalid values
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: User not registered/Invalid values
 *              example:
 *                message: User not registered/Invalid values
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 *      500:
 *        description: Internal server error.
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: server's error message
 */
router.delete("/users/:id/", auth, userController.deleteNuevo);

// cambiar contraseña
/**
 * @swagger
 * /users/{id}/contrasenya:
 *  put:
 *    summary: Changes user's password
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: integer
 *        description: User's ID which password is updated.
 *        example: 62795e42312401ed8495e677
 *    tags: [User]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              password:
 *                type: string
 *                description: user's new password
 *            required:
 *              - password
 *            example:
 *              password: pw12345678!!
 *    responses:
 *      200:
 *        description: Password changed successfully
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Password changed successfully
 *              example:
 *                message: Password changed successfully
 *      400:
 *        description: User not registered/Invalid values
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: User not registered/Invalid values
 *              example:
 *                message: User not registered/Invalid values
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 *      500:
 *        description: Internal server error.
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: server's error message
 */
router.put(
  "/users/:id/contrasenya",
  auth,
  userController.cambiarContrasenyaNuevo
);

// Cambiar correo
/**
 * @swagger
 * /users/{id}/correo:
 *  put:
 *    summary: Change user's mail
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: integer
 *        description: User's ID which mail is updated.
 *        example: 62795e42312401ed8495e677
 *    tags: [User]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              mail:
 *                type: string
 *                description: user's new mail
 *            required:
 *              - mail
 *            example:
 *              mail: exampleNew@gmail.com
 *    responses:
 *      200:
 *        description: Mail changed successfully
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Mail changed successfully
 *              example:
 *                message: Mail changed successfully
 *      400:
 *        description: User not registered/Invalid values
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: User not registered/Invalid values
 *              example:
 *                message: User not registered/Invalid values
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 *      500:
 *        description: Internal server error.
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: server's error message
 */
router.put("/users/:id/correo", auth, userController.cambiarCorreoNuevo);

// penalize user
/**
 * @swagger
 * /users/{id}/penalizacion:
 *  post:
 *    summary: ADMIN ONLY. Penalizes user
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: integer
 *        description: User's ID whose penalized.
 *        example: 62795e42312401ed8495e677
 *    tags: [Admin]
 *    responses:
 *      200:
 *        description: Penalizacion registrada
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Penalizacion registrada
 *              example:
 *                message: Penalizacion registrada
 *      400:
 *        description: User not registered/Invalid values
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: User not registered/Invalid values
 *              example:
 *                message: User not registered/Invalid values
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 *      500:
 *        description: Internal server error.
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: server's error message
 */
router.post("/users/:id/penalizacion", auth, userController.penalizarNuevo);

// obtener penalizaciones agrupando por user
/**
 * @swagger
 * /users/penalizacion:
 *  get:
 *    summary: ADMIN ONLY. Obtains all penalizations
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: query
 *        name: filter
 *        schema:
 *          type: string
 *          example: asc
 *        description: type of ordering (asc or desc)
 *    tags: [Admin]
 *    responses:
 *      200:
 *        description: All penalizations made by admin are obtained
 *        content:
 *          'application/json':
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Penalizaciones'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 *      500:
 *        description: Internal server error.
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: server's error message
 */
router.get("/users/penalizacion", auth, userController.obtenerPenalizaciones);

// grouping by reason, outputs the number of users deleted
/**
 * @swagger
 * /users/motivo:
 *  get:
 *    summary: ADMIN ONLY. Obtains number of deleted user's grouping by reason
 *    security:
 *      - bearerAuth: []
 *    tags: [Admin]
 *    responses:
 *      200:
 *        description: Reasons with number of users for each one
 *        content:
 *          'application/json':
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Motivos'
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 *      500:
 *        description: Internal server error.
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: server's error message
 */
router.get("/users/motivo", auth, userController.numUsersPorMotivo);

// obtener gasolineras en base a un filtro
/**
 * @swagger
 * /mapa/gasolineras:
 *  get:
 *    summary: Obtains gas station's based on a filter
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *       - in: query
 *         name: margen
 *         schema:
 *           type: string
 *         example: D,I,N
 *         required: true
 *         description: filter by margin options (D -> right, I -> left, N -> unknown)
 *       - in: query
 *         name: tipoVenta
 *         schema:
 *           type: string
 *         example: P,R
 *         required: true
 *         description: filter by type of sale options (P -> public, R -> private)
 *       - in: query
 *         name: tipoCarburantes
 *         schema:
 *           type: string
 *         example: precioGasoleoA,precioGasoleoB,precioGasolina95E10
 *         required: true
 *         description: filter by type of fuel options (precioBiodiesel, precioBioetanol, precioGasNaturalComprimido,
 *                                                      precioGasNaturalLicuado, precioGasesLicuadosDelPetroleo, precioGasoleoA, precioGasoleoB,
 *                                                      precioGasoleoPremium, precioGasolina95E10, precioGasolina95E5, precioGasolina95E5Premium,
 *                                                      precioGasolina98E10, precioGasolina98E5, precioHidrogeno)
 *    tags: [Mapa]
 *    responses:
 *      200:
 *        description: Info is obtained
 *        content:
 *          'application/json':
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Gasolinera'
 *      500:
 *        description: Error interno al obtener gasolineras para el mapa.
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Error interno al obtener gasolineras
 *              example:
 *                message: Error interno al obtener gasolineras
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 */
router.get("/mapa/gasolineras", auth, gasolineraController.filtrarGasolineras);

// Obtener gasolineras con los datos necesarios para mostrarlas en el foro
/**
 * @swagger
 * /foro:
 *  get:
 *    summary: Obtains all gas station's
 *    security:
 *      - bearerAuth: []
 *    tags: [Foro]
 *    responses:
 *      200:
 *        description: Gas sation's are obtained
 *        content:
 *          'application/json':
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Gasolinera'
 *      500:
 *        description: Error al obtener gasolineras del foro
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Error al obtener gasolineras del foro
 *              example:
 *                message: Error al obtener gasolineras del foro
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 */
router.get(
  "/foro",
  auth,
  gasolineraController.obtenerGasolinerasForoOptimizado
);

// crear entrada
/**
 * @swagger
 * /foro/entradas:
 *  post:
 *    summary: Adds new entry
 *    security:
 *      - bearerAuth: []
 *    tags: [Foro]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            $ref: '#/components/schemas/Entrada'
 *    responses:
 *      200:
 *        description: Entry is created without failure
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Entrada creada
 *              example:
 *                message: Entrada creada
 *      500:
 *        description: Failure in the process
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Error al crear la entrada
 *              example:
 *                message: Error al crear la entrada
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 */
router.post("/foro/entradas", auth, entradaController.crearEntrada);

// eliminar entrada
/**
 * @swagger
 * /foro/entradas/{idEntrada}:
 *  delete:
 *    summary: ADMIN ONLY. Deletes an entry
 *    tags: [Admin]
 *    parameters:
 *       - in: path
 *         name: idEntrada
 *         schema:
 *           type: string
 *         example: 6271bd689951800f93efd0de
 *         required: true
 *         description: unique entry identifier
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              penalizar:
 *                type: boolean
 *                description: true if we must penalize user. false in the other case.
 *            required:
 *              - penalizar
 *            example:
 *              penalizar: true
 *    responses:
 *      200:
 *        description: Entry has been succesfully deleted
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Entrada eliminada
 *              example:
 *                message: Entrada eliminada con/sin penalización
 *      400:
 *        description: Bad request
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Entrada eliminada pero el usuario ya no existe
 *              example:
 *                message: Entrada eliminada pero el usuario ya no existe
 *      500:
 *        description: Failure in the process
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Error al crear la entrada
 *              example:
 *                message: Error al crear la entrada
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 */
router.delete(
  "/foro/entradas/:idEntrada",
  auth,
  entradaController.eliminarEntrada
);

// obtener todas las entradas de una gasolinera del foro
/**
 * @swagger
 * /foro/entradas/{idGasolinera}:
 *  get:
 *    summary: Obtains all entries for a specified gas station
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *       - in: path
 *         name: idGasolinera
 *         schema:
 *           type: string
 *         example: 5122
 *         required: true
 *         description: gas station's unique identifier
 *    tags: [Foro]
 *    responses:
 *      200:
 *        description: Info is obtained
 *        content:
 *          'application/json':
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Entrada'
 *      500:
 *        description: Error al obtener entradas de la gasolinera
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Error al obtener entradas de la gasolinera
 *              example:
 *                message: Error al obtener entradas de la gasolinera
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 */
router.get(
  "/foro/entradas/:idGasolinera",
  auth,
  entradaController.obtenerEntradasGasolinera
);

// publicar comentario
/**
 * @swagger
 * /foro/entradas/comentarios:
 *  post:
 *    summary: Adds new comment
 *    tags: [Foro]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            $ref: '#/components/schemas/Foro'
 *    responses:
 *      200:
 *        description: comment is published without failure
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Comentario publicado
 *              example:
 *                message: Comentario publicado
 *      500:
 *        description: Failure in the process
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Error al publicar el comentario
 *              example:
 *                message: Error al publicar el comentario
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 */
router.post(
  "/foro/entradas/comentarios",
  auth,
  comentarioController.publicarComentario
);

// eliminar comentario
/**
 * @swagger
 * /foro/entradas/comentarios/{idComentario}:
 *  delete:
 *    summary: ADMIN ONLY. Deletes a comment
 *    tags: [Admin]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *       - in: path
 *         name: idComentario
 *         schema:
 *           type: string
 *         example: 627296c0ec89e95f1350df58
 *         required: true
 *         description: unique comment identifier
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              penalizar:
 *                type: boolean
 *                description: true if we must penalize user. false in the other case.
 *            required:
 *              - penalizar
 *            example:
 *              penalizar: false
 *    responses:
 *      200:
 *        description: Comment has been succesfully deleted
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Comentario eliminado con/sin penalización
 *              example:
 *                message: Comentario eliminado con/sin penalización
 *      400:
 *        description: Comentario eliminado pero el usuario ya no existe
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Comentario eliminado pero el usuario ya no existe
 *              example:
 *                message: Comentario eliminado pero el usuario ya no existe
 *      500:
 *        description: Failure in the process
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Error al crear la entrada
 *              example:
 *                message: Error al crear la entrada
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 */
router.delete(
  "/foro/entradas/comentarios/:idComentario",
  auth,
  comentarioController.eliminarComentario
);

// obtener todos los comentarios de una entrada del foro
/**
 * @swagger
 * /foro/entradas/comentarios/{idGasolinera}/{idEntrada}:
 *  get:
 *    summary: Obtains all comments for a specified gas station entry
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *       - in: path
 *         name: idGasolinera
 *         schema:
 *           type: string
 *         example: 5122
 *         required: true
 *         description: gas station's unique identifier
 *       - in: path
 *         name: idEntrada
 *         schema:
 *           type: string
 *         example: 625c11ec660a09080965b2b6
 *         required: true
 *         description: gas station's entry unique identifier
 *    tags: [Foro]
 *    responses:
 *      200:
 *        description: Info is obtained
 *        content:
 *          'application/json':
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Foro'
 *      500:
 *        description: Error al obtener comentarios.
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Error al obtener comentarios
 *              example:
 *                message: Error al obtener comentarios
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 */
router.get(
  "/foro/entradas/comentarios/:idGasolinera/:idEntrada",
  auth,
  comentarioController.obtenerComentariosEntrada
);

// Añadir una valoración
/**
 * @swagger
 * /ratings/{idGasolinera}:
 *  post:
 *    summary: Adds new rating to gas station
 *    tags: [Rating]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: idGasolinera
 *        required: true
 *        type: integer
 *        description: Gas sation's ID to rate.
 *        example: 5122
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            $ref: '#/components/schemas/Rating'
 *    responses:
 *      200:
 *        description: Rating realizado con éxito
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Rating realizado con éxito
 *              example:
 *                message: Rating realizado con éxito
 *      500:
 *        description: Internal server error.
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Error al valorar
 *              example:
 *                message: Error al valorar
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 */
router.post("/ratings/:idGasolinera", auth, ratingsController.anyadirRating);

// Obtener todas las gasolineras junto a su valoración
/**
 * @swagger
 * /ratings:
 *  get:
 *    summary: Obtains every gas station with it's rating
 *    tags: [Rating]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: Info is obtained
 *        content:
 *          'application/json':
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/GasolinerasRating'
 *      500:
 *        description: Internal server error.
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Error interno al obtener gasolinerasRating
 *              example:
 *                message: Error interno al obtener gasolinerasRating
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 */
router.get("/ratings", ratingsController.obtenerGasolinerasRating);

// Obtener todas las gasolineras junto a su valoración (paginado para optimizarlo en la pantalla de valoraciones)
/**
 * @swagger
 * /ratings/paginado:
 *  get:
 *    summary: Obtains every gas station with it's rating
 *    tags: [Rating]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: query
 *        name: pagina
 *        schema:
 *          type: string
 *          example: 1
 *        description: number of page
 *      - in: query
 *        name: numPorPag
 *        schema:
 *          type: string
 *          example: 1
 *        description: number per page
 *    responses:
 *      200:
 *        description: Info is obtained
 *        content:
 *          'application/json':
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/GasolinerasRating'
 *      500:
 *        description: Internal server error.
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Error interno al obtener gasolinerasRating
 *              example:
 *                message: Error interno al obtener gasolinerasRating
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 */
router.get(
  "/ratings/paginado",
  ratingsController.obtenerGasolinerasRatingPaginado
);

// obtener número total de usuarios registrados
/**
 * @swagger
 * /users/total:
 *  get:
 *    summary: ADMIN ONLY. Obtains total number of registered users
 *    security:
 *      - bearerAuth: []
 *    tags: [Admin]
 *    responses:
 *      200:
 *        description: Total de usuarios registrados
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                total:
 *                  type: number
 *                  description: Total de usuarios registrados
 *              example:
 *                total: 8
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 *      500:
 *        description: Internal server error.
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: server's error message
 */
router.get("/users/total", auth, userController.totalUsuarios);

// obtener la cantidad de usuarios nuevos agrupando por fecha
/**
 * @swagger
 * /users/nuevos:
 *  get:
 *    summary: ADMIN ONLY. Obtains number of new users grouping by date
 *    security:
 *      - bearerAuth: []
 *    tags: [Admin]
 *    responses:
 *      200:
 *        description: Nuevos usuarios agrupando por fecha
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                newUsers:
 *                  type: number
 *                  description: Nuevos usuarios agrupando por fecha
 *              example:
 *                message: [ {"_id": {"day": 16, "month": 5, "year":2022}, "newUsers": 2},  {"_id": {"day": 30, "month": 4, "year":2022}, "newUsers": 19}]
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 *      500:
 *        description: Internal server error.
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: server's error message
 */
router.get("/users/nuevos", auth, userController.nuevosUsuarios);

// obtener la cantidad de comentarios nuevos agrupando por fecha
/**
 * @swagger
 * /foro/entradas/comentarios/nuevos:
 *  get:
 *    summary: ADMIN ONLY. Obtains number of new comments grouping by date
 *    security:
 *      - bearerAuth: []
 *    tags: [Admin]
 *    responses:
 *      200:
 *        description: Nuevos comentarios agrupando por fecha
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                newComments:
 *                  type: number
 *                  description: Nuevos comentarios agrupando por fecha
 *              example:
 *                message: [ {"_id": {"day": 16, "month": 5, "year":2022}, "newComments": 2},  {"_id": {"day": 30, "month": 4, "year":2022}, "newComments": 19}]
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 *      500:
 *        description: Internal server error.
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: server's error message
 */
router.get(
  "/foro/entradas/comentarios/nuevos",
  auth,
  comentarioController.nuevosComentarios
);

// Obtains last data update (date and time)
/**
 * @swagger
 * /gasolineras/fecha:
 *  get:
 *    summary: ADMIN ONLY. Obtains last data update (date and time)
 *    security:
 *      - bearerAuth: []
 *    tags: [Admin]
 *    responses:
 *      200:
 *        description: Fecha y hora de la ultima actualizacion de datos
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                fecha:
 *                  type: string
 *                  description: Fecha
 *                hora:
 *                  type: string
 *                  description: Hora
 *              example:
 *                fecha: 16/May/2022
 *                hora: 2:5:0
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 */
router.get("/gasolineras/fecha", auth, gasolineraController.lastUpdateInfo);

/**
 * @swagger
 * /gasolineras/precio/{idGasolinera}:
 *  post:
 *    summary: ADMIN. Gets prices from gas station
 *    tags: [Admin]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: idGasolinera
 *        required: true
 *        type: integer
 *        description: Gas sation's ID to rate.
 *        example: 5122
 *    responses:
 *      200:
 *        description: Pricing obtained successfully
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Pricing obtained successfully
 *              example:
 *                message: Pricing obtained successfully
 *      500:
 *        description: Internal server error
 *        content:
 *          'application/json':
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Error al valorar
 *              example:
 *                message: Error al valorar
 *      401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *      403:
 *        $ref: '#/components/responses/NotValidError'
 */
router.get(
  "/gasolineras/precio/:idGasolinera",
  gasolineraController.preciosGasolinera
);
/*async function prove() {
  const response = await axios
    .get(
      "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=eyJhbGciOiJSUzI1NiIsImtpZCI6ImIxYTgyNTllYjA3NjYwZWYyMzc4MWM4NWI3ODQ5YmZhMGExYzgwNmMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMTE3Mzc1Nzk3NjctNzJyZzFuNHZvODM3MWM3MmJuZmE5aWVjZ2hqcXQ3bXQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIxMTczNzU3OTc2Ny03MnJnMW40dm84MzcxYzcyYm5mYTlpZWNnaGpxdDdtdC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjEwNDcyMDEzNTc2MzU0ODMzNjQ4NCIsImhkIjoidW5pemFyLmVzIiwiZW1haWwiOiI3NTcxNjZAdW5pemFyLmVzIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJSSHBXekRGM08xUVJDMEVSMG12VUR3IiwibmFtZSI6IlBhYmxvIEpvcmTDoW4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUFUWEFKeE1pOGhtZ21WTkdKdlVmYnEyR21uS1hvaFF1N0J6b2NLcE1OVGE9czk2LWMiLCJnaXZlbl9uYW1lIjoiUGFibG8iLCJmYW1pbHlfbmFtZSI6IkpvcmTDoW4iLCJsb2NhbGUiOiJlcyIsImlhdCI6MTY1Mjk3NTY0NywiZXhwIjoxNjUyOTc5MjQ3LCJqdGkiOiI4OWQzNjE0NmIzNmU0OTg1MzgyNGQyMzFmZTEzMDdhMmE3MjVmNjk2In0.m5tTf1Bgp4UeJ-ZyGyoWeoeDcJhM1S-S1rybZqe4x5qursq0Bo4yCt3JqZgoWkkFUvGqGHIuTDRWxBQv4wugSJ1_xvCu61o1-92zBuoNDNJvNxvQPnBEtPXcwNC5q4FIhNCWvhtuEemqhS3jrGJPxVDeOoc942KH5Kkg8It23kBhUVVT4y18ZzFragWoPc_UYoHDjNbGpS4LVLJY8FsLlEWe-7yR1UFGF7k9UNBQC7eyhqcNKWwF0UORH8lK1Ke3OsRukk7a8KRMfy4RKLM2JzjuM1Agvd-i_tdJSU8kRXTDj2RylHjvOWvvXJOjir9WrLDwsaAfsfUvUr4Lkh575w"
    )
    .catch(function (error) {
      console.log(error);
    });
}*/

//prove();

module.exports = router;
