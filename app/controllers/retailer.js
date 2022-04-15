const { Op } = require("sequelize");

const logger = require("../config/logger");
const db = require("../models");

const addone = async (req, res) => {
  let newretailer = req.body;
  // contact and fullname are mandatory fields
  try {
    let retailer = await db.Retailer.findOne({
      where: {
        [Op.or]: [
          { contact: req.body.contact },
          { email: req.body.email },
          { fullname: req.body.fullname },
        ],
      },
    });
    if (retailer) {
      res.status(400).json({ msg: "Retailer already exist" });
      logger.info(
        `${system_user}| attempted to add and existing retailer record: ${req.body.contact}`
      );
    } else {
      await db.Retailer.create(newretailer);
      res.status(200).json({
        msg: "Retailer added succesfuly",
      });
      logger.info(
        `${system_user}| Added a retailer record: ${req.body.contact}`
      );
    }
  } catch (e) {
    res.status(500).json({
      msg: "error occurred, try again or contact support",
    });
    logger.error(
      `${system_user}| Could not add retailer  ${req.body.contact} + due to: ${e}`
    );
  }
};

const editone = async (req, res) => {
  let retailer = await db.Retailer.findByPk(req.params.id);
  try {
    if (retailer) {
      await db.Retailer.update(req.body);
      logger.info(`${system_user}| Updated retailer: ${retailer.id}`);
      res.status(200).json({ msg: "Retailer updated successfully" });
    } else {
      res.satus(404).json({ msg: "Retailer does not exist" });
      logger.info(`${system_user}| attempted to edit a missing retailer`);
    }
  } catch (e) {
    res.status(500).json({
      msg: "Error occurred, try again or contact support",
    });
    logger.error(`${system_user}| Could not edit retailer due to:  ${e}`);
  }
};

const getalldetailed = async (req, res) => {
  let retailers = await db.Retailer.findAll({
    order: [["createdAt", "DESC"]],
    include: { model: db.Sale, model: db.Purchase, model: db.Releasedstock },
  });
  if (retailers.length != 0) {
    try {
      res.status(200).send(retailers);
      logger.info(`${system_user}| Requested all retailers' list`);
    } catch (e) {
      res.status(500).json({
        msg: "Error occurred, try again or contact support",
      });
      logger.error(`${system_user}| Could not get all retailers due to:  ${e}`);
    }
  } else {
    res.status(404).json({ msg: "No retailers exist" });
    logger.info(`${system_user}| requested all retailers and found no records`);
  }
};

const deleteone = async (req, res) => {
  let retailer = await db.Retailer.findByPk(req.params.id);
  try {
    if (retailer) {
      await db.Retailer.destroy();
      logger.infor(
        `${system_user}| deleted retailer: ${retailer.fullname} ${retailer.contact}`
      );
      res.status(200).json({ msg: "retailer deleted successfully" });
    } else {
      res.satus(404).json({ msg: "Retailer does not exist" });
      logger.info(`${system_user}| attempted to delete a missing retailer`);
    }
  } catch (e) {
    res.status(500).json({
      msg: "Error occurred, try again or contact support",
    });
    logger.error(`${system_user}| Could not delete retailer due to:  ${e}`);
  }
};

module.exports = { addone, editone, deleteone, getalldetailed };
