//module 
const dotenv = require("dotenv");

//files
const logger = require("./logger")

//config env
dotenv.config()

const config = {
    "development": {
        "username": process.env.DBuser1,
        "password": process.env.DBpass1,
        "database": process.env.DBname1,
        "host": "127.0.0.1",
        "dialect": "mysql",
        "logging": msg => logger.info(msg)
    },
    "test": {
        "username": "root",
        "password": null,
        "database": "database_test",
        "host": "127.0.0.1",
        "dialect": "mysql",
        "logging": msg => logger.info(msg)
    },
    "production": {
        "username": process.env.DBuser2,
        "password": process.env.DBpass2,
        "database": process.env.DBname2,
        "host": "127.0.0.1",
        "dialect": "mysql",
        "logging": msg => logger.info(msg)
    }
}

module.exports = config;