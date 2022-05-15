const logger = require("../config/logger");
const bucket = require("../config/bucket");
const fs = require("fs");

const stockfileupload = async (file, afterUpload, newExpense, req, res) => {
  try {
    let myfile = bucket.file(file.name);
    fs.createReadStream(file.tempFilePath)
      .pipe(myfile.createWriteStream())
      .on("error", function (err) {
        logger.error("upload failed due to: " + error);
        res
          .status(500)
          .json({ msg: "Error Occured . Try again or contact support" });
      })
      .on("finish", function () {
        logger.info(file.name + " Uploaded successful");
        afterUpload();
      });
  } catch (error) {
    logger.error("upload failed due to: " + error);
    res
      .status(500)
      .json({ msg: "Error Occured . Try again or contact support" });
  }
};

const imagefileupload = async (file) => {
  try {
    let myfile = bucket.file(file.name);
    fs.createReadStream(file.tempFilePath)
      .pipe(myfile.createWriteStream())
      .on("error", function (err) {
        logger.error("upload failed due to: " + error);
        res
          .status(500)
          .json({ msg: "Error Occured . Try again or contact support" });
      })
      .on("finish", function () {
        logger.info(file.name + " Uploaded successful");
      });
  } catch (error) {
    logger.error("upload failed due to: " + error);
    res
      .status(500)
      .json({ msg: "Error Occured . Try again or contact support" });
  }
};
let fileUpload = { stockfileupload, imagefileupload };
module.exports = fileUpload;
