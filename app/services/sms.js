const axios = require("axios");
const dotenv = require("dotenv");
const logger = require("../config/logger")

dotenv.config();
let config = {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: "Bearer " + process.env.SMSkey,
  },
};

//send sms
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


//sms delivered
const deliveryreport = async (req, res) => {
  let sms = await db.Sms.findOne(req.body.correlator);
  await db.Sms.update(
    { sent: true },
    {
      where: {
        id: sms.dataValues.id,
      },
    }
  );
  logger.info(`sms to ${sms.phone} delivered`);
  res.status(200);
};
module.exports = {deliveryreport, sendSms};
