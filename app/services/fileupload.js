const axios = require("axios").default;
const dotenv = require("dotenv");
const FormData = require("form-data");

const logger = require("../config/logger");
dotenv.config();

const fileupload = async (file) => {
  const formData = new FormData(),
    config = {
      headers: {
        ...formData.getHeaders(),
      },
    };
  formData.append("file", file.tempFilePath, file.name);
  await axios
    .post(process.env.fileapi, formData, config)
    .then(async function (response) {
      logger.info(response.data.msg);
    })
    .catch(function (error) {
      res.status(500).json({
        msg: "Could not upload image try again or contact support",
      });
      logger.error("upload failed due to: " + error);
    });
  next();
};

module.exports = fileupload;
