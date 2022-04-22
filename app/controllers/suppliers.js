const { Op } = require("sequelize");

const logger = require("../config/logger");
const db = require("../models");

const addone = async (req, res) => {
  let newsupplier = req.body;
  // fullname are mandatory fields
  try {
    let supplier = await db.Supplier.findOne({
      where: {
        [Op.or]: [
          { contact: req.body.contact || "" },
          { email: req.body.email || "" },
          { fullname: req.body.fullname },
        ],
      },
    });
    if (supplier) {
      res.status(400).json({ msg: "supplier already exist" });
      logger.info(
        `${system_user}| attempted to add and existing supplier record: ${req.body.fullname} ${req.body.contact}`
      );
    } else {
      await db.Supplier.create(newsupplier);
      res.status(200).json({
        msg: "supplier added succesfuly",
      });
      logger.info(
        `${system_user}| Added a supplier record: ${req.body.fullname} ${req.body.contact}`
      );
    }
  } catch (e) {
    res.status(400).json({
      msg: "error occurred, try again or contact support",
    });
    logger.error(
      `${system_user}| Could not add supplier ${req.body.fullname}  ${req.body.contact} + due to: ${e}`
    );
  }
};

const editone = async (req, res) => {
  let supplier = await db.Supplier.findByPk(req.params.id);
  try {
    if (supplier) {
      await db.Supplier.update(req.body, { where: { id: req.params.id } });
      logger.info(
        `${system_user}| Updated supplier: ${supplier.id} ${supplier.fullname}`
      );
      res.status(200).json({ msg: "Supplier updated successfully" });
    } else {
      res.status(404).json({ msg: "supplier does not exist" });
      logger.info(`${system_user}| attempted to edit a missing supplier`);
    }
  } catch (e) {
    res.status(500).json({
      msg: "Error occurred, try again or contact support",
    });
    logger.error(`${system_user}| Could not edit supplier due to:  ${e}`);
  }
};

const getall = async (req, res) => {
  let suppliers = await db.Supplier.findAll();
  if (suppliers.length != 0) {
    try {
      res.status(200).send(suppliers);
      logger.info(`${system_user}| Requested all supplier's list`);
    } catch (e) {
      res.status(500).json({
        msg: "Error occurred, try again or contact support",
      });
      logger.error(`${system_user}| Could not get all suppliers due to:  ${e}`);
    }
  } else {
    res.status(404).json({ msg: "No cusomers exist" });
    logger.info(`${system_user}| requested all suppliers and found no records`);
  }
};

const getalldetailed = async (req, res) => {
  let suppliers = await db.Supplier.findAll({
    order: [["createdAt", "DESC"]],
    include: [{ model: db.Otherstocking }, { model: db.Stocking }],
  });
  if (suppliers.length != 0) {
    try {
      res.status(200).send(suppliers);
      logger.info(`${system_user}| Requested all supplier's detail list`);
    } catch (e) {
      res.status(500).json({
        msg: "Error occurred, try again or contact support",
      });
      logger.error(`${system_user}| Could not get all suppliers due to:  ${e}`);
    }
  } else {
    res.status(404).json({ msg: "No cusomers exist" });
    logger.info(`${system_user}| requested all suppliers and found no records`);
  }
};

const deleteone = async (req, res) => {
  let supplier = await db.Supplier.findByPk(req.params.id);
  try {
    if (supplier) {
      await db.Supplier.destroy({ where: { id: req.params.id } });
      logger.info(
        `${system_user} | deleted supplier: ${supplier.fullname}  ${supplier.contact}`
      );
      res.status(200).json({ msg: "Supplier deleted successfully" });
    } else {
      res.satus(404).json({ msg: "supplier does not exist" });
      logger.info(`${system_user}| attempted to delete a missing supplier`);
    }
  } catch (e) {
    res.status(500).json({
      msg: "Error occurred, try again or contact support",
    });
    logger.error(`${system_user}| Could not delete supplier due to:  ${e}`);
  }
};

const getone = async (req, res) => {
  try {
    let supplier = await db.Supplier.findByPk(req.params.id, {
      include: [{ model: db.Otherstocking }, { model: db.Stocking }],
    });
    if (supplier) {
      res.status(200).send(supplier);
      logger.info(
        `${system_user}| Requested all supplier <${supplier.id}> ${supplier.fullname}`
      );
    } else {
      res.satus(404).json({ msg: "supplier does not exist" });
      logger.info(`${system_user}| requested a missing supplier`);
    }
  } catch (e) {
    res.status(500).json({
      msg: "Error occurred, try again or contact support",
    });
    logger.error(
      `${system_user}| Could not <${req.params.id}> get supplier due to:  ${e}`
    );
  }
};

module.exports = { addone, getall, editone, deleteone, getalldetailed, getone };
