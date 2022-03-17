const transporter = require("../config/emailconfig");
const logger = require("../config/logger");

const sendemail = async (sentby, sendto, subject, text, next) => {
  try {
    let mailOptions = {
      from: '"Crostech Foods Business Portal" <bp.admin@crosstechfoods.co.ke>',
      cc: sentby || "",
      to: sendto,
      subject: subject,
      text: text,
    };
    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        logger.error("unnable to send email because:" + error);
      } else {
        logger.info(
          `sent email: ${info.messageId} sent: ${info.response}  to: ${sendto}`
        );
      }
    });
  } catch (e) {
    logger.error("emailing error occured because: " + e);
  }
  next;
};

module.exports = sendemail;
