const transporter = require("../../config/emailconfig");
const logger = require("../../config/logger");

const sendemail = async (email) => {
  try {
    let mailInfo = {
      from: '"Crostech Foods Business Portal" <bp.admin@crosstechfoods.co.ke>',
      to: email.sendto,
      replyTo: email.replyto || "",
      cc: email.cc || "",
      subject: email.subject,
      template: email.template,
      context: email.context || "",
      dsn: {
        id: Math.floor(Math.random() * 1000),
        return: "full",
        notify: ["failure", "delay", "success"],
        recipient: "mathew@crosstechfoods.co.ke",
      },
    };
    transporter.sendMail(mailInfo);
    logger.info(`email '${email.subject}' sent to ${email.sendto}`);
  } catch (e) {
    logger.error(
      `Email '${email.subject}' not sent to ${email.sendto} due to: ${e}`
    );
  }
};

module.exports = sendemail;
