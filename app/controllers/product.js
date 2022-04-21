const logger = require("../config/logger");
const db = require("../models");

const getall = async (req, res) => {
  try {
    const product = await db.Product.findAll({
      order: [["createdAt", "DESC"]],
      include: {
        model: db.Package,
        // model: db.Expense,
        // model: db.Stocking,
        // model: db.Sale,
      },
    });
    if (product.length != 0) {
      res.status(200).send(product);
      logger.info(`${system_user}| requested all products`);
    } else {
      res.status(404).json({ msg: "No Products exist" });
      logger.info(`${system_user}| requested all products but found none`);
    }
  } catch (e) {
    res.status(500).json({
      msg: "Error occurred, try again or contact support",
    });
    logger.error(
      `${system_user}| encountered error when getting all products due to: ${e}`
    );
  }
};

const addnew = async (req, res) => {
  try {
    let myproduct = await db.Product.findOne({
      where: { name: req.body.name },
    });
    if (!myproduct) {
      let product = await db.Product.create({
        name: req.body.name,
        description: req.body.description,
        measure: req.body.measure,
      });
      res.status(200).json({ msg: "success" });
      logger.info(
        `${system_user}| added a new product: ${product.dataValues.name}<${product.dataValues.id}>`
      );
    } else {
      res.status(400).json({ msg: "Product exists" });
      logger.info(`${system_user}| tried adding existing product`);
    }
  } catch (e) {
    logger.error(
      `${system_user}| encountered error when adding new product due to: ${e}`
    );
  }
};

const update = async (req, res) => {
  let id = req.params.id,
    product = await db.Product.findByPk(id);
  // should only be able to edit name, description and measure
  if (!product) {
    res.status(404).json({ msg: "product not found" });
    logger.info(`${system_user}| tried editing a missing product`);
  } else {
    try {
      await db.Product.update(req.body, {
        where: {
          id: id,
        },
      });
      res.status(200).json({ msg: "success" });
      logger.info(
        `${system_user}| edited product: ${product.name}<${product.id}>`
      );
    } catch (e) {
      res.status(500).json({ msg: "encoutered an error updating" });
      logger.error(
        `${system_user}| could not update product details due to: ${e}`
      );
    }
  }
};

const getone = async (req, res) => {
  let id = req.params.id;
  try {
    let product = await db.Product.findByPk(id, {
      order: [["createdAt", "DESC"]],
      include: [
        { model: db.Package },
      ],
    });
    if (product) {
      res.status(200).send(product);
      logger.info(
        `${system_user}| requested product: ${product.name}<${product.id}>`
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

const getonedetailed = async (req, res) => {
  let id = req.params.id;
  try {
    let product = await db.Product.findByPk(id, {
      order: [["createdAt", "DESC"]],
      include: [
        { model: db.Package },
        { model: db.Stocking },
        { model: db.Sale },
        { model: db.Packaging },
        { model: db.Expense },
      ],
    });
    if (product) {
      res.status(200).send(product);
      logger.info(
        `${system_user}| requested product: ${product.name}<${product.id}>`
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

const getalldetailed = async (req,res) => {
  try {
    const product = await db.Product.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        { model: db.Package },
        { model: db.Stocking },
        { model: db.Sale },
        { model: db.Packaging },
        { model: db.Expense },
      ],
    });
    if (product.length != 0) {
      res.status(200).send(product);
      logger.info(`${system_user}| requested all products`);
    } else {
      res.status(404).json({ msg: "No Products exist" });
      logger.info(`${system_user}| requested all products but found none`);
    }
  } catch (e) {
    res.status(500).json({
      msg: "Error occurred, try again or contact support",
    });
    logger.error(
      `${system_user}| encountered error when getting all prdoucts due to: ${e}`
    );
  }
};
// no delete function because our product and their life cycle are eternal in reality or in memory
module.exports = {
  getall,
  addnew,
  update,
  getone,
  getonedetailed,
  getalldetailed,
};
