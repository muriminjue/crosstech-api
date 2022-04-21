const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();
let config = {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: "Bearer " + process.env.SMSkey,
  },
};

const sendSms = async (data) => {
    let textdetails = {
            sender: "Crosstech",
            message: data.message,
            phone: data.phone,
            correlator: data.correlator,
            endpoint: process.env.SMSresapi,
    }
  try {
    await axios
      .post(process.env.SMSapi + "/send-sms", textdetails, config)
      .then(async function (response) {
        logger.info(newotp.phone + " " + response.data[0].message);
      });
    return true;
  } catch (error) {
    logger.error("sms failed due to: " + error);
    return false;
  }
};
module.exports = sendSms;
