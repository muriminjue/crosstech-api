const db = require("../models");
const logger = require("../config/logger");
const fileupload = require("../services/fileupload");

// stock product
const purchaseprod = async (req, res) => {
  let productid = req.body.product,
    product = await db.Product.findByPk(productid);
  if (product) {
    let amount = parseInt(req.body.quantity) + product.amount,
      total = parseInt(req.body.quantity) + product.total,
      newStocking = {
        quantity: req.body.quantity,
        description: req.body.description,
        cost: req.body.cost,
        invoiceNo: req.body.invoiceNo,
        supplierId: req.body.supplierId,
        productsId: productid,
        userId: system_userid,
      };
    try {
      let stocking = await db.Stocking.create(newStocking);
      await db.Product.update(
        { amount: amount, total: total },
        {
          where: {
            id: productid,
          },
        }
      );
      if (req.files) {
        let file = req.files.receipt;
        await fileupload(file);
        await db.Stocking.update(
          {
            receipt: file.name,
          },
          {
            where: {
              id: stocking.dataValues.id,
            },
          }
        );
      }
      res.status(200).json({ msg: "Stock Updated" });
      logger.info(
        `${system_user}| updated stock for <${product.id}> ${product.name}`
      );
    } catch (e) {
      res
        .status(500)
        .json({ msg: "Error occurred, try again or contact support" });
      logger.error(`${system_user}| Could not add new stock due to: ${e}`);
    }
  } else {
    res.status(404).json({ msg: "Product you selected does not exist" });
    logger.info(`${system_user}| tried adding stock to missing product`);
  }
};

const updatestocking = async (req, res) => {
  let stocking = await db.Stocking.findByPk(req.params.id);
  if (stocking) {
    try {
      await db.Stocking.update(req.body, {
        where: {
          id: stocking.id,
        },
      });
      if (req.body.quantity) {
        let product = await db.Product.findByPk(stocking.productsId),
          difference = parseInt(req.body.quantity) - stocking.quantity,
          amount = product.amount + difference,
          total = product.total + difference;
        await db.Product.update(
          { amount: amount, total: total, cost: req.body.cost },
          {
            where: {
              id: product.id,
            },
          }
        );
      }
      res.status(200).json({ msg: "Stock updated succesfully" });
      logger.info(
        `${system_user}| updated stock for <${product.id}> ${product.name}`
      );
    } catch (e) {
      res
        .status(500)
        .json({ msg: "Error occurred, try again or contact support" });
      logger.error(`${system_user}| Could not add new stock due to: ${e}`);
    }
  } else {
    res.status(404).json({ msg: "Record does not exist" });
    logger.info(`${system_user}| tried editing missing stock`);
  }
};

const uploadStockreceipt = async (req, res) => {
  let stocking = await db.Stocking.findByPk(req.params.id),
    product = await db.Product.findByPk(stocking.productId);
  if (req.files) {
    if (stocking) {
      let file = req.files;
      await fileupload(file);
      await db.Stocking.update(
        { receipt: file.name },
        { where: { id: req.params.id } }
      );
      res.status(200).json({ msg: "Stock updated succesfully" });
      logger.info(
        `${system_user}| updated stock ${stocking.id} for <${product.id}> ${product.name}`
      );
    } else {
      res.status(404).json({ msg: "Record does not exist" });
      logger.info(`${system_user}| tried adding receipt to missing stock`);
    }
  } else {
    res.status(400).json({ msg: "No attached file" });
    logger.info(`${system_user}| uploaded empty reciept field`);
  }
};
const deletestocking = async (req, res) => {
  let stocking = await db.Stocking.findByPk(req.params.id),
    product = await db.Product.findByPk(stocking.productId);
  if (stocking) {
    try {
      let amount = product.amount - stocking.quantity,
        total = product.total - stocking.quantity;
      await db.Stocking.destroy({ where: { id: req.params.id } });
      await db.Product.update(
        { amount: amount, total: total },
        { where: { id: stocking.productId } }
      );
      res.status(200).json({ msg: "Stock deleted succesfully" });
      logger.info(`${system_user}| Deleted stocking ${stocking.invoiceNo}`);
    } catch (e) {
      res
        .status(500)
        .json({ msg: "Error occurred, try again or contact support" });
      logger.error(`${system_user}| Could not delete stock due to: ${e}`);
    }
  } else {
    res.status(404).json({ msg: "Record does not exist" });
    logger.info(`${system_user}| attempted to delete missing stocking record`);
  }
};

// const getallstocking = async (req, res) => {
//   try {
//     let stockings = await db.stocking.findAll({
//       order: [["createdAt", "DESC"]],
//     });
//     if (stockings.length != 0) {
//       res.status(200).send(stockings);
//       logger.info(`${system_user}| fetched all stocking`);
//     } else {
//       res.status(404).json({ msg: "Records do not exist" });
//       logger.info(
//         `${system_user}| attempted to fetch stocking record and found none`
//       );
//     }
//   } catch (e) {
//     res
//       .status(504)
//       .json({ msg: "Error occurred, try again or contact support" });
//     logger.error(`${system_user}| Could not fetch all stocking due to: ${e}`);
//   }
// };

const getonestocking = async (req, res) => {
  try {
    let stocking = await db.Stocking.findByPk(req.params.id, {
      include: { model: db.Supplier, model: db.Product, model: db.User },
    });
    if (stocking) {
      res.status(200).send(stocking);
      logger.info(
        `${system_user}| fetched stock ${stocking.id} for <${stocking.product.id}> ${stocking.product.name}`
      );
    } else {
      res.status(404).json({ msg: "Record does not exist" });
      logger.info(`${system_user}| attempted to fetch missing stocking record`);
    }
  } catch (e) {
    res
      .status(500)
      .json({ msg: "Error occurred, try again or contact support" });
    logger.error(`${system_user}| Could not delete stock due to: ${e}`);
  }
};

const getallstockingdetailed = async (req, res) => {
  try {
    let stockings = await db.Stocking.findAll({
      order: [["createdAt", "DESC"]],
      include: { model: db.Supplier, model: db.Product, model: db.User },
    });
    if (stockings.length != 0) {
      res.status(200).send(stockings);
      logger.info(`${system_user}| fetched all stocking`);
    } else {
      res.status(404).json({ msg: "Records do not exist" });
      logger.info(
        `${system_user}| attempted to fetch all stocking records and found none`
      );
    }
  } catch (e) {
    res
      .status(500)
      .json({ msg: "Error occurred, try again or contact support" });
    logger.error(`${system_user}| Could not fetch all stocking due to: ${e}`);
  }
};
// package product

const packageproduct = async (req, res) => {
  try {
    let productId = req.body.product,
      packageId = req.body.package,
      number = parseInt(req.body.number),
      package = await db.Package.findByPk(packageId),
      product = await db.Package.findByPk(productId),
      // update packaging
      newPackaging = {
        packageId: productId,
        productId: packageId,
        userId: system_userid,
        number: number,
      };
    if (package && product) {
      let newtotal = package.number + number,
        newAmount = product.amount - package.quantity * number;
      await db.Packaging.create(newPackaging);
      /// update package
      await db.Package.update(
        { amount: newtotal },
        { where: { id: packageId } }
      );
      //update product
      await db.Product.update(
        { amount: newAmount },
        { where: { id: productId } }
      );
      res.status(200).json({ msg: "Record created succesfuly" });
      logger.info(
        `${system_user}| updated packaging for <${package.id}> ${package.name}`
      );
    } else {
      res
        .status(404)
        .json({ msg: "Selected package or product does not exist" });
      logger.info(`${system_user}| attempted to update missing package`);
    }
  } catch (e) {
    res
      .status(500)
      .json({ msg: "Error occurred, try again or contact support" });
    logger.error(`${system_user}| Could not update packaging due to: ${e}`);
  }
};

const deletepackaging = async (req, res) => {
  try {
    let packaging = await db.Packaging.findByPk(req.params.id),
      package = await db.Package.findByPk(packaging.packageId),
      product = await db.Package.findByPk(packaging.productId);
    if (packaging) {
      let newtotal = package.number - packaging.number,
        newAmount = product.amount + packaging.number * package.quantity;
      await db.Package.update(
        { number: newtotal },
        { where: { id: packaging.packageId } }
      );
      await db.Product.update(
        { amount: newAmount },
        { where: { id: packaging.productId } }
      );
      await db.Packaging.destroy({ where: { id: product.id } });
      res.status(200).json({ msg: "Packaging deleted succesfully" });
      logger.info(
        `${system_user}| Deleted a packaging for ${product.name} ${package.name}${product.measure}`
      );
    } else {
      res.status(404).json({ msg: "Selected packaging does not exist" });
      logger.info(`${system_user}| attempted to delete missing packaging`);
    }
  } catch (e) {
    res
      .status(500)
      .json({ msg: "Error occurred, try again or contact support" });
    logger.error(`${system_user}| Could not delete packaging due to: ${e}`);
  }
};

// const editpackaging

const getonepackaging = async (req, res) => {
  try {
    let packaging = await db.Packaging.findByPk(req.params.id, {
      include: { model: db.Package, model: db.Product, model: db.User },
    });
    if (packaging) {
      res.status(200).send(packaging);
      logger.info(
        `${system_user}| fetched stock ${packaging.id} for <${packaging.product.id}> ${packaging.product.name}`
      );
    } else {
      res.status(404).json({ msg: "Record does not exist" });
      logger.info(
        `${system_user}| attempted to fetch missing packaging record`
      );
    }
  } catch (e) {
    res
      .status(500)
      .json({ msg: "Error occurred, try again or contact support" });
    logger.error(
      `${system_user}| Could not delete packaging record due to: ${e}`
    );
  }
};

const getallpackaging = async (req, res) => {
  try {
    let packagings = await db.Packaging.findAll({
      order: [["createdAt", "DESC"]],
      include: { model: db.Package, model: db.Product, model: db.User },
    });
    if (packagings.length != 0) {
      res.status(200).send(packagings);
      logger.info(`${system_user}| fetched all packaging`);
    } else {
      res.status(404).json({ msg: "Records do not exist" });
      logger.info(
        `${system_user}| attempted to fetch all packaging records and found none`
      );
    }
  } catch (e) {
    res
      .status(500)
      .json({ msg: "Error occurred, try again or contact support" });
    logger.error(
      `${system_user}| Could not fetch all packaging records due to: ${e}`
    );
  }
};

// other stock
const addothertockitem = async (req, res) => {
  try {
    let package = await db.Package.findByPk(req.body.package),
      total = parseInt(req.body.number) + package.total,
      otherstock = await db.Otherstock.create({
        name: req.body.name,
        description: req.body.description,
        units: req.body.units,
        packageId: req.body.pacakage,
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

const purchaseotherstock = async (req, res) => {
  let otherstockid = req.body.otherstock,
    otherstock = await db.Otherstock.findByPk(otherstockid);
  if (otherstock) {
    let newStocking = {
      number: req.body.number,
      description: req.body.description,
      cost: req.body.cost,
      invoiceNo: req.body.invoiceNo,
      supplierId: req.body.supplierId,
      otherstockId: otherstockid,
      userId: system_userid,
    };
    try {
      let otherstocking = await db.Otherstocking.create(newStocking),
        number = parseInt(req.body.number) + otherstock.number;
      await db.Otherstock.update(
        { number: number },
        {
          where: {
            id: otherstockid,
          },
        }
      );
      if (req.files) {
        let file = req.files.receipt;
        await fileupload(file);
        await db.Otherstocking.update(
          {
            receipt: file.name,
          },
          {
            where: {
              id: otherstocking.dataValues.id,
            },
          }
        );
      }
      res.status(200).json({ msg: "Stock item updated" });
      logger.info(
        `${system_user}| updated stock item for <${otherstock.id}> ${otherstock.name}`
      );
    } catch (e) {
      res
        .status(500)
        .json({ msg: "Error occurred, try again or contact support" });
      logger.error(
        `${system_user}| Could not add item stocking record due to: ${e}`
      );
    }
  } else {
    res.status(404).json({ msg: "Stock Item you selected does not exist" });
    logger.info(`${system_user}| tried adding stock item to missing product`);
  }
};

const updateotherstocking = async (req, res) => {
  let otherstocking = await db.Otherstocking.findByPk(req.params.id);
  if (otherstocking) {
    try {
      await db.Otherstocking.update(req.body, {
        where: {
          id: otherstocking.id,
        },
      });
      if (req.body.number) {
        let otherstock = await db.Package.findByPk(otherstocking.otherstockId),
          difference = parseInt(req.body.number) - otherstocking.number,
          number = package.number + difference;
        await db.Otherstock.update(
          { number: number },
          {
            where: {
              id: otherstock.id,
            },
          }
        );
      }
      res.status(200).json({ msg: "Stock item updated succesfully" });
      logger.info(
        `${system_user}| updated stock for <${product.id}> ${product.name}`
      );
    } catch (e) {
      res
        .status(500)
        .json({ msg: "Error occurred, try again or contact support" });
      logger.error(`${system_user}| Could not add new stock due to: ${e}`);
    }
  } else {
    res.status(404).json({ msg: "Record does not exist" });
    logger.info(`${system_user}| tried editing missing stock`);
  }
};

const uploadOtherstockreceipt = async (req, res) => {
  let otherstocking = await db.Otherstocking.findByPk(req.params.id),
    otherstock = await db.Otherstock.findByPk(otherstock.packageId);
  if (req.files) {
    if (otherstocking) {
      let file = req.files;
      await fileupload(file);
      await db.Otherstocking.update(
        { receipt: file.name },
        { where: { id: req.params.id } }
      );
      res.status(200).json({ msg: "Item stocking updated succesfully" });
      logger.info(
        `${system_user}| updated stock ${otherstocking.id} for <${otherstock.id}> ${otherstock.name}`
      );
    } else {
      res.status(404).json({ msg: "Record does not exist" });
      logger.info(`${system_user}| tried adding receipt to missing item stock`);
    }
  } else {
    res.status(400).json({ msg: "No attached file" });
    logger.info(`${system_user}| uploaded empty reciept field`);
  }
};

const deleteotherstocking = async (req, res) => {
  let otherstocking = await db.Otherstocking.findByPk(req.params.id),
    otherstock = await db.otherstocking.findByPk(otherstocking.otherstockId);
  if (stocking) {
    try {
      let amount = otherstock.number - otherstocking.number;
      total = product.total - stocking.quantity;
      await db.Othertocking.destroy({ where: { id: req.params.id } });
      await db.Otherstock.update(
        { amount: amount, total: total },
        { where: { id: otherstock.id } }
      );
      res.status(200).json({ msg: "Item stocking deleted succesfully" });
      logger.info(`${system_user}| Deleted stocking ${stocking.invoiceNo}`);
    } catch (e) {
      res
        .status(500)
        .json({ msg: "Error occurred, try again or contact support" });
      logger.error(
        `${system_user}| Could not delete item stocking due to: ${e}`
      );
    }
  } else {
    res.status(404).json({ msg: "Record does not exist" });
    logger.info(
      `${system_user}| attempted to delete missing item stocking record`
    );
  }
};

const getoneotherstocking = async (req, res) => {
  try {
    let otherstocking = await db.Otherstocking.findByPk(req.params.id, {
      include: { model: db.Supplier, model: db.Otherstock, model: db.User },
    });
    if (otherstocking) {
      res.status(200).send(otherstocking);
      logger.info(
        `${system_user}| fetched item stocking ${otherstocking.id} for <${otherstocking.otherstock.id}> ${otherstocking.otherstock.name}`
      );
    } else {
      res.status(404).json({ msg: "Record does not exist" });
      logger.info(
        `${system_user}| attempted to fetch missing item stocking record`
      );
    }
  } catch (e) {
    res
      .status(500)
      .json({ msg: "Error occurred, try again or contact support" });
    logger.error(`${system_user}| Could not delete item stocking due to: ${e}`);
  }
};

const getallotherstockingdetailed = async (req, res) => {
  try {
    let otherstockings = await db.Otherstocking.findAll({
      order: [["createdAt", "DESC"]],
      include: { model: db.Supplier, model: db.Otherstock, model: db.User },
    });
    if (otherstockings.length != 0) {
      res.status(200).send(otherstockings);
      logger.info(`${system_user}| fetched all item stocking`);
    } else {
      res.status(404).json({ msg: "Records do not exist" });
      logger.info(
        `${system_user}| attempted to fetch all item stocking records and found none`
      );
    }
  } catch (e) {
    res
      .status(500)
      .json({ msg: "Error occurred, try again or contact support" });
    logger.error(
      `${system_user}| Could not fetch all item stocking due to: ${e}`
    );
  }
};

// realeasing stock
// assign stock
const assignstock = async (req, res) => {
  if (req.body.toretailer) {
    try {
      let retailer = await db.Retaler.findByPk(req.body.retailer);
      if (retailer) {
        let newassignment = {
          name: req.body.name,
          description: req.body.description,
          quantity: req.body.description,
          packageId: req.body.package,
          retailerId: req.body.retailer,
        };
        await db.Realeasestock.create(newassignment);
        logger.info(`${system_user}| assigned stock to ${retailer.id}`);
        res.status(200).json({ msg: "assignement successful" });
      } else {
        res.status(404).json({ msg: "Retailer does not exist" });
        logger.info(
          `${system_user}| attempted to assign stock to missing retailer`
        );
      }
    } catch (e) {
      res
        .status(500)
        .json({ msg: "Error occurred, try again or contact support" });
      logger.error(`${system_user}| Could not assign stock due to: ${e}`);
    }
  } else {
    try {
      let user = await db.User.findByPk(req.body.user);
      if (user) {
        let newassignment = {
          name: req.body.name,
          description: req.body.description,
          quantity: req.body.description,
          packageId: req.body.package,
          userId: req.body.user,
        };
        await db.Realeasestock.create(newassignment);
        logger.info(`${system_user}| assigned stock to ${user.id}`);
        res.status(200).json({ msg: "assignement successful" });
      } else {
        res.status(404).json({ msg: "User does not exist" });
        logger.info(
          `${system_user}| attempted to assign stock to missing user`
        );
      }
    } catch (e) {
      res
        .status(500)
        .json({ msg: "Error occurred, try again or contact support" });
      logger.error(`${system_user}| Could not assign stock due to: ${e}`);
    }
  }
};
// undo assign
const undoassignstock = async (req, res) => {
  try {
    let assigned = await db.Releasedstock.findByPk(req.params.id);
    if (assigned) {
      await db.Releasedstock.update(
        { quantity: req.body.quantity },
        { where: { id: req.params.id } }
      );
      res.status(200).json({ msg: "assignement ammended successfully" });
      logger.info(
        `${system_user}| ammended a stock assignement to ${assigned.UserId}`
      );
    } else {
      res.status(404).json({ msg: "Assignement does not exist" });
      logger.info(`${system_user}| attempted to ammend missing assignment`);
    }
  } catch (e) {
    res
      .status(500)
      .json({ msg: "Error occurred, try again or contact support" });
    logger.error(
      `${system_user}| Could not ammend assigned stock due to: ${e}`
    );
  }
};

const getassignedstock = async (req, res) => {
  try {
    let assigned = await db.Releasedstock.findAll();
    if (assigned.length != 0) {
      res.status(200).send(assigned);
      logger.info(`${system_user}| fetched all assigned stock`);
    } else {
      res.status(404).json({ msg: "No records to show" });
      logger.info(`${system_user}| found no record for assigned stock`);
    }
  } catch (e) {
    res
      .status(500)
      .json({ msg: "Error occurred, try again or contact support" });
    logger.error(`${system_user}| Could not fetch all assigned due to: ${e}`);
  }
};

module.exports = {
  purchaseprod,
  updatestocking,
  uploadStockreceipt,
  deletestocking,
  getallstockingdetailed,
  getonestocking,
  packageproduct,
  deletepackaging,
  getallpackaging,
  getonepackaging,
  addothertockitem,
  purchaseotherstock,
  updateotherstocking,
  uploadOtherstockreceipt,
  deleteotherstocking,
  getoneotherstocking,
  getallotherstockingdetailed,
  assignstock,
  undoassignstock,
  getassignedstock,
};
