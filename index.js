//modules & variables
const express = require("express");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");

//files
const logger = require("./app/config/logger");
const db = require("./app/models");
const router = require("./router");
const { routineTasks } = require("./app/services/tasks");

//settings
dotenv.config();

//App constants
const Port = process.env.PORT;

//init app
const app = express();

//pass json
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

//file uploads
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

//router
app.use("/api", router);

//seqeulize sync
// db.sequelize.sync({
//   force: true,
// });

//run app

(async () => {
  await db.sequelize.authenticate();
  logger.info("db connected");
})()
  .then(async () => {
    await routineTasks();
  })
  .catch((error) => {
    logger.error(error);
  })
  .finally(async () => {
    app.listen(Port, async () => {
      logger.info(`App running at port: ${Port}`);
    });
  });
