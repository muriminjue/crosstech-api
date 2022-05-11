const db = require("../models");
const logger = require("../config/logger");

const getall = async (req, res) => {
  try {
    let package = await db.Package.findAll({
      order: [["createdAt", "DESC"]],
      include: {
        model: db.Product,
      },
    });
    if (package.length != null) {
      res.status(200).send(package);
      logger.info(`${system_user}| requested all packages`);
    } else {
      res.status(404).json({ msg: "No packages exist" });
      logger.info(`${system_user}| requested all packages but found none`);
    }
  } catch (e) {
    res.status(500).json({
      msg: "Error occurred, try again or contact support",
    });
    logger.error(
      `${system_user}| encountered error when getting  all packages  due to: ${e}`
    );
  }
};

const addnew = async (req, res) => {
  try {
    let mypackage = await db.Package.findOne({
      where: { quantity: req.body.quantity },
    });
    if (!mypackage) {
      let package = await db.Package.create({
        productId: req.body.product,
        quantity: parseFloat(req.body.quantity),
        price: parseFloat(req.body.price),
      });
      res.status(200).json({ msg: "success" });
      logger.info(
        `${system_user}| added a new package: ${package.dataValues.name}<${package.dataValues.id}>`
      );
    } else {
      res.status(400).json({ msg: "Package exists" });
      logger.info(`${system_user}| tried adding existing package`);
    }
  } catch (e) {
    res.status(500).json({
      msg: "Error occurred, try again or contact support",
    });
    logger.error(
      `${system_user}| encountered error when adding new package due to: ${e}`
    );
  }
};

const getone = async (req, res) => {
  let id = req.params.id;
  try {
    let package = await db.Package.findByPk(id, {
      order: [["createdAt", "DESC"]],
      include: {
        model: db.Product,
      },
    });
    if (package) {
      res.status(200).send(package);
      logger.info(
        `${system_user}| requested package: ${package.name}<${package.id}>`
      );
    } else {
      res.status(404).json({ msg: "No Products exist" });
      logger.info(`${system_user}| none existent package`);
    }
  } catch (e) {
    res.status(500).json({
      msg: "Error occurred, try again or contact support",
    });

    logger.error(
      `${system_user}| encountered error when getting  package  due to: ${e}`
    );
  }
};

const editone = async (req, res) => {
  let id = req.params.id,
    package = await db.Package.findByPk(id);
  // should only be able to edit quantity and price
  if (!package) {
    res.status(404).json({ msg: "package not found" });
    logger.info(`${system_user}| tried editing a missing package`);
  } else {
    try {
      await db.Package.update({...req.body, productId: req.body.product}, {
        where: {
          id: id,
        },
      });
      res.status(200).json({ msg: "success" });
      logger.info(
        `${system_user}| edited package: ${package.name}<${package.id}>`
      );
    } catch (e) {
      res.status(500).json({ msg: "encoutered an error updating" });
      logger.error(
        `${system_user}| could not update package details due to: ${e}`
      );
    }
  }
};
const getonedetailed = async (req, res) => {
  let id = req.params.id;
  try {
    let package = await db.Package.findByPk(id, {
      include: [
        { model: db.Product },
        { model: db.Otherstock },
        { model: db.Packaging },
        { model: db.Sale },
        { model: db.Releasedstock },
      ],
    });
    if (package) {
      res.status(200).send(package);
      logger.info(
        `${system_user}| requested product: ${package.name}<${package.id}>`
      );
    } else {
      res.status(404).json({ msg: "No Products exist" });
      logger.info(`${system_user}| none existent product`);
    }
  } catch (e) {
    res.status(500).json({
      msg: "Error occurred, try again or contact support",
    });
    logger.error(
      `${system_user}| encountered error when getting  product  due to: ${e}`
    );
  }
};

const getalldetailed = async (req, res) => {
  try {
    let package = await db.Package.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        { model: db.Product },
        { model: db.Otherstock },
        { model: db.Packaging },
        { model: db.Sale },
        { model: db.Releasedstock },
      ],
    });
    if (package.length != 0) {
      res.status(200).send(package);
      logger.info(`${system_user}| requested all packages`);
    } else {
      res.status(404).json({ msg: "No packages exist" });
      logger.info(`${system_user}| requested all packages but found none`);
    }
  } catch (e) {
    res.status(500).json({
      msg: "Error occurred, try again or contact support",
    });
    logger.error(
      `${system_user}| encountered error when getting  all packages  due to: ${e}`
    );
  }
};
module.exports = {
  getall,
  addnew,
  getone,
  getalldetailed,
  getonedetailed,
  editone,
};
