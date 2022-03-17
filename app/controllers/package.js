const db = require("../models");

const getall = async (req, res) => {
  try {
  } catch (e) {
    let package = await db.Package.findAll({
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
  }
  logger.error(
    `${system_user}| encountered error when getting  all packages  due to: ${e}`
  );
};

const addnew = async (req, res) => {
  try {
    let package = await db.Package.create({
      productId: req.body.product,
      quantity: parseInt(req.body.quantity),
      price: parseInt(req.body.price),
    });
    res.status(200).json({ msg: "success" });
    logger.info(
      `${system_user}| added a new package: ${package.dataValues.name}<${package.dataValues.id}>`
    );
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

const editone = async (req, res) => {
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
const getonedetailed = async (req, res) => {
  let id = req.params.id;
  try {
    let package = await db.Package.findByPk(id, {
      order: [["createdAt", "DESC"]],
      include: {
        model: db.Product,
        model: db.Otherstock,
        model: db.Packaging,
        model: db.Sale,
      },
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
  } catch (e) {
    let package = await db.Package.findAll({
      include: {
        model: db.Product,
        model: db.Otherstock,
        model: db.Packaging,
        model: db.Sale,
      },
    });
    if (package.length != 0) {
      res.status(200).send(package);
      logger.info(`${system_user}| requested all packages`);
    } else {
      res.status(404).json({ msg: "No packages exist" });
      logger.info(`${system_user}| requested all packages but found none`);
    }
  }
  res.status(500).json({
    msg: "Error occurred, try again or contact support",
  });
  logger.error(
    `${system_user}| encountered error when getting  all packages  due to: ${e}`
  );
};
module.exports = {
  getall,
  addnew,
  getone,
  getalldetailed,
  getonedetailed,
  editone,
};
