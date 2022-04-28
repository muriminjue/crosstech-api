const logger = require("../config/logger");
const db = require("../models");

const addnew = async (req, res) => {
  try {
    let otherstock = await db.Otherstock.create({
      name: req.body.name,
      description: req.body.description,
      units: req.body.units,
      packageId: req.body.package,
    });
    res.status(200).json({ msg: "success" });
    logger.info(
      `${system_user}| added a new Stock item: ${otherstock.dataValues.name}<${otherstock.dataValues.id}>`
    );
  } catch (e) {
    res.status(500).json({
      msg: "Error occurred, try again or contact support",
    });
    logger.error(
      `${system_user}| encountered error when adding new stock item due to: ${e}`
    );
  }
};
const getall = async (req, res) => {
  let otherstock = await db.Otherstock.findAll({
    order: [["createdAt", "DESC"]],
  });
  try {
    if (otherstock.length > 0) {
      res.status(200).send(otherstock);
      logger.info(`${system_user}| requested and received all Stock items`);
    } else {
      res.status(404).json({ msg: "No records exist" });
      logger.info(`${system_user}| requested and found no Stock items`);
    }
  } catch (e) {
    res.status(500).json({
      msg: "Error occurred, try again or contact support",
    });
    logger.error(
      `${system_user}| encountered while fetching all stock items due to: ${e}`
    );
  }
};

const getone = async (req, res) => {
  let otherstock = await db.Otherstock.findByPk(req.params.id, {
    include: [
      { model: db.Package },
      { model: db.Otherstocking },
      { model: db.Expense },
    ],
  });
  try {
    if (otherstock) {
      res.status(200).send(otherstock);
      logger.info(
        `${system_user}| requested and received ${otherstock.name} <${otherstock.id}> Stock items`
      );
    } else {
      res.status(404).json({ msg: "No records exist" });
      logger.info(
        `${system_user}| requested and no Stock item  ${req.params.id}`
      );
    }
  } catch (e) {
    res.status(500).json({
      msg: "Error occurred, try again or contact support",
    });
    logger.error(
      `${system_user}| encountered while fetching all stock items due to: ${e}`
    );
  }
};
const getalldetailed = async (req, res) => {
  let otherstock = await db.Otherstock.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      { model: db.Package },
      { model: db.Otherstocking },
      { model: db.Expense },
    ],
  });
  try {
    if (otherstock) {
      res.status(200).send(otherstock);
      logger.info(
        `${system_user}| requested and received detailed Stock items`
      );
    } else {
      res.status(404).json({ msg: "No records exist" });
      logger.info(
        `${system_user}| requested and found no detailed Stock items`
      );
    }
  } catch (e) {
    res.status(500).json({
      msg: "Error occurred, try again or contact support",
    });
    logger.error(
      `${system_user}| encountered while fetching all detailed stock items due to: ${e}`
    );
  }
};

const getallpackage = async (req, res) => {
  let otherstock = await db.Otherstock.findAll({
    order: [["createdAt", "DESC"]],
    where: { packageId: req.params.id },
  });
  try {
    if (otherstock) {
      res.status(200).send(otherstock);
      logger.info(
        `${system_user}| requested and received detailed Stock items`
      );
    } else {
      res.status(404).json({ msg: "No records exist" });
      logger.info(
        `${system_user}| requested and found no detailed Stock items`
      );
    }
  } catch (e) {
    res.status(500).json({
      msg: "Error occurred, try again or contact support",
    });
    logger.error(
      `${system_user}| encountered while fetching all detailed stock items due to: ${e}`
    );
  }
};

const editone = async (req, res) => {
  let otherstock = await db.otherstock.findByPk(req.params.id);
  try {
    if (otherstock) {
      await db.otherstock.update(req.body, { where: { id: req.params.id } });
      res.status(200).json({ msg: "success" });
      logger.info(`${system_user}| updated other stcok item ${req.params.id}`);
    } else {
      res.status(404).json({ msg: "Item does not exist" });
      logger.info(
        `${system_user}| reir updating a non exostent stock item ${req.params.id}`
      );
    }
  } catch (e) {
    res
      .status(500)
      .json({ msg: "Error occurred, try again or contact support" });
    logger.error(
      `${system_user}| encountered while updating stock item due to: ${e}`
    );
  }
};

module.exports = {
  addnew,
  editone,
  getall,
  getalldetailed,
  getone,
  getallpackage
};
