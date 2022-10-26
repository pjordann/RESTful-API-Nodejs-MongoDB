# REFUEL
NodeJS + Express API for our STW project. It uses MongoDB as database.

# Description
This backend service connects to the Spanish Government official website in order to obtain information about fuel pricing. After this data is fetched, it is processed and saved in a MongoDb databse instance. This process runs periodically, every 24 hours. Also, there is a twitter bot that compares fuel prices and publishes 1 tweet a day with the cheapest fuel and where it is sold.  
For this, we have used NodeJS, Express framework, MongoDB database and numerous libraries.

# Pre-requisites

- Install [Node.js](https://nodejs.org/en/) version 15.0.0

# Getting started

- Clone the repository

```
git clone https://github.com/pjordann/RESTful-API-Nodejs-MongoDB
```

- Install dependencies

```
cd backend
npm install
```

- Build and run the project

```
npm start
```

Navigate to `http://localhost:3003`. Problem? You will need .env file.

- API Document endpoints

/api-doc

# Getting started 2

You can fire up our API by clicking [here](https://reloop-back.herokuapp.com/api-doc)

## Project Structure

The folder structure of this app is explained below:

| Name                | Description                                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| **node_modules**    | Contains all npm dependencies                                                                              |
| **src**             | Contains source code that will be compiled.                                                                |
| **src/controllers** | Controllers define functions to serve various express routes.                                              |
| **src/routes**      | Contain all express routes with endpoint documentation.                                                    |
| **src/models**      | Models define schemas that will be used in storing and retrieving data from Application database (MongoDB) |
| **src/cron**        | Where periodic work is implemented                                                                         |
| app.js              | Entry point to express app                                                                                 |
| package.json        | Contains npm dependencies                                                                                  |

## Authors
* [Sergio Benítez](https://github.com/SergioBenitez755787)
* [Pablo Jordán](https://github.com/pjordann)
