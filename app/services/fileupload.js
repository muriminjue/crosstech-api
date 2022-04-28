const axios = require("axios").default;
const dotenv = require("dotenv");
const FormData = require("form-data");

const formData = new FormData()

const logger = require("../config/logger");
dotenv.config();

const stockfileupload = async (file, afterUpload, newExpense, req, res) => {

  let  config = {
      headers: {
        ...formData.getHeaders(),
      },
    };

  formData.append("file", file.tempFilePath, file.name);
  axios
    .post(process.env.fileapi, formData, config)
    .then(function (response) {
      logger.info(response.data.msg);
      afterUpload()
    })
    .catch(function (error) {
      logger.error("upload failed due to: " + error);
      res.status(500).json({msg:"Error Occured . Try again or contact support"})
    });
};

const imagefileupload = async(file)=> {
  let  config = {
    headers: {
      ...formData.getHeaders(),
    },
  };
  formData.append("file", file.tempFilePath, file.name);

  axios
    .post(process.env.fileapi, formData, config)
    .then(function (response) {
      logger.info(response.data.msg);
    })
    .catch(function (error) {
      logger.error("upload failed due to: " + error);
      res.status(500).json({msg:"Error Occured . Try again or contact support"})
    });
}
let fileUpload = {stockfileupload, imagefileupload}
module.exports = fileUpload;
