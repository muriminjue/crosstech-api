const schedule = require("node-schedule");
const { Op } = require("sequelize");

const db = require("../models/index");
const logger = require("../config/logger");

//routine tasks
const routineTasks = async () => {
  try {
    // delete stale Otps
    await schedule.scheduleJob("*/5 * * * *", async (fireDate) => {
      let otps = await db.Otp.findAll({
        where: {
          createdAt: {
            [Op.lte]: new Date(new Date() - 15 * 60 * 1000),
          },
        },
      }),
        delay = new Date() - fireDate;
      if (otps.length == 0) {
        logger.info(`Scheduled task| <delete stale OTP> No OTPs found (${Math.floor(delay / 1000)}s delay)`);
      } else {
        try {
          await otps.forEach(async (otp) => {
            await db.Otp.destroy({ where: { id: otp.id } });
          })
          logger.info(`Scheduled task| <delete stale OTP> deleted stale OTPs`);
        } catch (e) {
          logger.error(`Scheduled task| <delete stale OTP> could not delete ot due to ${e}`);
        }

      }
    });
  } catch (e) {
    logger.error(`Scheduled task| <delete stale OTP> Encountered error`);
  }
};


module.exports = {  routineTasks };
