const { Op } = require("sequelize");

const db = require("../models");
const logger = require("../config/logger");
const fileUpload = require("../services/fileupload");

// stock product
const purchaseprod = async (req, res) => {
  let productid = req.body.product,
    product = await db.Product.findByPk(productid),
    supplier = await db.Supplier.findByPk(req.body.supplier);
  if (product && supplier) {
    let amount = parseFloat(req.body.quantity) + parseFloat(product.amount),
      total = parseFloat(req.body.quantity) + parseFloat(product.total),
      newStocking = {
        quantity: req.body.quantity,
        description: req.body.description,
        cost: req.body.cost,
        invoiceNo: req.body.invoiceNo,
        supplierId: req.body.supplier,
        productId: productid,
        userId: system_userid,
      };
    try {
      let isStocking = await db.Stocking.findOne({
        where: { invoiceNo: newStocking.invoiceNo },
      });
      if (!isStocking) {
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
          file.name = `stock-${stocking.invoiceNo}-${new Date().getDate()}-${
            new Date().getMonth() + 1
          }-${new Date().getFullYear()}${file.name.slice(
            file.name.lastIndexOf(".")
          )}`;
          let newExpense = {
            date: new Date(),
            amount: req.body.cost,
            receipt: file.name,
            receiptNo: req.body.invoiceNo,
            paidto: supplier.fullname,
            stockingId: stocking.id,
            productId: productid,
            userId: system_userid,
          };
          let afterUpload = async () => {
            await db.Stocking.update(
              { receipt: file.name },
              { where: { id: newExpense.stockingId } }
            );
            await db.Expense.create(newExpense);
          };
          await fileUpload.stockfileupload(file, afterUpload, newExpense);
        }
        res.status(200).json({ msg: "Stock Updated" });
        logger.info(
          `${system_user}| Purchased stock for <${product.id}> ${product.name}`
        );
      } else {
        res.status(400).json({ msg: "record exists" });
        logger.info(`${system_user}| Tried adding existing stocking event`);
      }
    } catch (e) {
      res
        .status(500)
        .json({ msg: "Error occurred, try again or contact support" });
      logger.error(`${system_user}| Could not add new stock due to: ${e}`);
    }
  } else {
    res
      .status(404)
      .json({ msg: "Product or supplier you selected does not exist" });
    logger.info(`${system_user}| tried adding stock to missing product`);
  }
};

const updatestocking = async (req, res) => {
  let stocking = await db.Stocking.findByPk(req.params.id);
  if (stocking) {
    let expense = await db.Expense.findOne({
      where: { stockingId: stocking.id },
    });
    let product = await db.Product.findByPk(stocking.productId);
    try {
      await db.Stocking.update(
        {
          ...req.body,
          productId: req.body.product,
          supplierId: req.body.supplier,
        },
        {
          where: {
            id: stocking.id,
          },
        }
      );
      if (req.body.quantity) {
        let difference =
          parseFloat(req.body.quantity) - parseFloat(stocking.quantity);
        let amount = parseFloat(product.amount) + difference,
          total = parseFloat(product.total) + difference;
        await db.Product.update(
          { amount: amount, total: total },
          {
            where: {
              id: product.id,
            },
          }
        );
      }
      if (expense && req.body.cost) {
        await db.Stocking.update(
          { adjusted: true },
          {
            where: {
              id: stocking.id,
            },
          }
        );
        await db.Expense.update(
          { receiptNo: req.body.invoiceNo },
          { where: { id: expense.id } }
        );
        await db.Adjustment.create({
          amount: req.body.cost - expense.amount,
          expenseId: expense.id,
        });
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
  try {
    let stocking = await db.Stocking.findByPk(req.params.id);
    let product = await db.Product.findByPk(stocking.productId),
      supplier = await db.Supplier.findByPk(stocking.supplierId);
    if (req.files) {
      let file = req.files.receipt;
      file.name = `stock-${stocking.invoiceNo}-${new Date().getDate()}-${
        new Date().getMonth() + 1
      }-${new Date().getFullYear()}${file.name.slice(
        file.name.lastIndexOf(".")
      )}`;

      let newExpense = {
        date: stocking.createdAt,
        amount: stocking.cost,
        receipt: file.name,
        receiptNo: stocking.invoiceNo,
        paidto: supplier.fullname,
        stockingId: stocking.id,
        productId: product.id,
        userId: system_userid,
        productname: product.name,
      };
      if (stocking && stocking.receipt == null) {
        let afterUpload = async () => {
          await db.Stocking.update(
            { receipt: file.name },
            { where: { id: newExpense.stockingId } }
          );
          await db.Expense.create(newExpense);
          res.status(200).json({ msg: "Stock updated succesfully" });
          logger.info(
            `${system_user}| updated stock ${newExpense.stockingId} for <${product.id}> ${newExpense.productname}`
          );
        };
        await fileUpload.stockfileupload(file, afterUpload, newExpense);
      } else if (stocking && stocking.receipt != null) {
        let afterUpload = async () => {
          await db.Stocking.update(
            { receipt: file.name },
            { where: { id: newExpense.stockingId } }
          );
          await db.Expense.update(
            { receipt: file.name },
            { where: { stockingId: newExpense.stockingId } }
          );
          res.status(200).json({ msg: "Stock updated succesfully" });
          logger.info(
            `${system_user}| updated stock ${newExpense.stockingId} for <${newExpense.productId}> ${newExpense.productname}`
          );
        };
        await fileUpload.stockfileupload(file, afterUpload, newExpense);
      } else {
        res.status(404).json({ msg: "Record does not exist" });
        logger.info(`${system_user}| tried adding receipt to missing stock`);
      }
    } else {
      res.status(400).json({ msg: "No attached file" });
      logger.info(`${system_user}| uploaded empty reciept field`);
    }
  } catch (e) {
    res
      .status(500)
      .json({ msg: "Error occurred, try again or contact support" });
    logger.error(`${system_user}| Could not upload stock receipt due to: ${e}`);
  }
};

//do not create endpoint yet
const deletestocking = async (req, res) => {
  let stocking = await db.Stocking.findByPk(req.params.id);
  if (stocking) {
    let product = await db.Product.findByPk(stocking.productId);
    let expense = await db.Expense.findOne({
      where: { stockingId: stocking.id },
    });
    try {
      let amount = parseFloat(product.amount) - parseFloat(stocking.quantity),
        total = parseFloat(product.total) - parseFloat(stocking.quantity);
      await db.Stocking.update(
        {
          adjusted: true,
          description: "deleted",
          cost: 0,
          quantity: 0,
          invoiceNo: "",
        },
        { where: { id: req.params.id } }
      );
      await db.Product.update(
        { amount: amount, total: total },
        { where: { id: stocking.productId } }
      );
      if (expense) {
        await db.Adjustment.create({
          amount: 0 - parseFloat(expense.amount),
          expenseId: expense.id,
        });
      }
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

const getallstocking = async (req, res) => {
  try {
    let stockings = await db.Stocking.findAll({
      order: [["createdAt", "DESC"]],
      include: [{ model: db.Supplier }, { model: db.product }],
    });
    if (stockings.length != 0) {
      res.status(200).send(stockings);
      logger.info(`${system_user}| fetched all stocking`);
    } else {
      res.status(404).json({ msg: "Records do not exist" });
      logger.info(
        `${system_user}| attempted to fetch stocking record and found none`
      );
    }
  } catch (e) {
    res
      .status(504)
      .json({ msg: "Error occurred, try again or contact support" });
    logger.error(`${system_user}| Could not fetch all stocking due to: ${e}`);
  }
};

const getonestocking = async (req, res) => {
  try {
    let stocking = await db.Stocking.findByPk(req.params.id, {
      include: [
        {
          model: db.Supplier,
        },
        { model: db.Product },
        { model: db.User, attributes: ["username"] },
        { model: db.Expense },
      ],
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
      include: [
        { model: db.Supplier },
        { model: db.Product },
        { model: db.User, attributes: ["username"] },
        { model: db.Expense },
      ],
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
    let packageId = req.body.package,
      number = parseInt(req.body.number);
    let package = await db.Package.findByPk(packageId);
    let product = await db.Product.findByPk(package.productId);
    // update packaging
    let newPackaging = {
      packageId: packageId,
      productId: product.id,
      userId: system_userid,
      number: number,
    };
    if (package && product) {
      let newtotal = parseInt(package.number) + number,
        newAmount =
          parseFloat(product.amount) - parseFloat(package.quantity) * number;
      if (product.amount >= parseFloat(package.quantity) * number) {
        await db.Packaging.create(newPackaging);
        /// update package
        await db.Package.update(
          { number: newtotal },
          { where: { id: packageId } }
        );
        //update product
        await db.Product.update(
          { amount: newAmount },
          { where: { id: product.id } }
        );
      } else {
        res.status(400).json({
          msg: "not enough product",
        })`${system_user}| tried packing more product than is in store`;
      }
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
    let packaging = await db.Packaging.findByPk(req.params.id);
    let package = await db.Package.findByPk(packaging.packageId),
      product = await db.Product.findByPk(packaging.productId);
    if (packaging) {
      let newtotal = parseInt(package.number) - parseInt(packaging.number),
        newAmount =
          parseFloat(product.amount) +
          parseInt(packaging.number) * parseFloat(package.quantity);
      await db.Package.update(
        { number: newtotal },
        { where: { id: packaging.packageId } }
      );
      await db.Product.update(
        { amount: newAmount },
        { where: { id: packaging.productId } }
      );
      await db.Packaging.update(
        { removed: true },
        { where: { id: packaging.id } }
      );
      res.status(200).json({ msg: "Packaging deleted succesfully" });
      logger.info(
        `${system_user}| Deleted a packaging for ${product.name} ${package.quantity}${product.measure}`
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

// To edit packaging. Delete the parckaging and add the correct one

const getonepackaging = async (req, res) => {
  try {
    let packaging = await db.Packaging.findByPk(req.params.id, {
      include: [
        { model: db.Package },
        { model: db.Product },
        { model: db.User, attributes: ["username"] },
      ],
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
      include: [
        { model: db.Package },
        { model: db.Product },
        { model: db.User, attributes: ["username"] },
      ],
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
const purchaseotherstock = async (req, res) => {
  let otherstockid = req.body.otherstock,
    otherstock = await db.Otherstock.findByPk(req.body.otherstock),
    supplier = await db.Supplier.findByPk(req.body.supplier);
  if (otherstock) {
    let newStocking = {
      amount: parseFloat(req.body.amount),
      description: req.body.description,
      cost: req.body.cost,
      invoiceNo: req.body.invoiceNo,
      supplierId: req.body.supplier,
      otherstockId: otherstockid,
      userId: system_userid,
    };
    try {
      let isStocking = await db.Otherstocking.findOne({
        where: { invoiceNo: newStocking.invoiceNo },
      });
      if (!isStocking) {
        let otherstocking = await db.Otherstocking.create(newStocking),
          amount = parseFloat(req.body.amount) + parseFloat(otherstock.amount);
        await db.Otherstock.update(
          { amount: amount },
          {
            where: {
              id: otherstockid,
            },
          }
        );
        if (req.files) {
          let file = req.files.receipt;
          file.name = `stock-${
            otherstocking.invoiceNo
          }-${new Date().getDate()}-${
            new Date().getMonth() + 1
          }-${new Date().getFullYear()}${file.name.slice(
            file.name.lastIndexOf(".")
          )}`;

          let newExpense = {
            date: new Date(),
            amount: req.body.cost,
            receipt: file.name,
            receiptNo: req.body.invoiceNo,
            paidto: supplier.fullname,
            otherstockId: otherstockid,
            otherstockingId: otherstocking.id,
            userId: system_userid,
          };
          let afterUpload = async () => {
            await db.Otherstocking.update(
              { receipt: file.name },
              { where: { id: otherstocking.id } }
            );
            await db.Expense.create(newExpense);
          };
          await fileUpload.stockfileupload(file, afterUpload, newExpense);
        }
        res.status(200).json({ msg: "Stock item updated" });
        logger.info(
          `${system_user}| updated stock item for <${otherstock.id}> ${otherstock.name}`
        );
      } else {
        res.status(400).json({ msg: "Record exists" });
        logger.info(
          `${system_user}| tried adding existing otherstocking record`
        );
      }
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

const uploadOtherstockreceipt = async (req, res) => {
  try {
    let otherstocking = await db.Otherstocking.findByPk(req.params.id);
    let otherstock = await db.Otherstock.findByPk(otherstocking.otherstockId),
      supplier = await db.Supplier.findByPk(otherstocking.supplierId);
    if (req.files) {
      let file = req.files.receipt;
      file.name = `stock-${otherstocking.invoiceNo}-${new Date().getDate()}-${
        new Date().getMonth() + 1
      }-${new Date().getFullYear()}${file.name.slice(
        file.name.lastIndexOf(".")
      )}`;

      let newExpense = {
        date: otherstocking.createdAt,
        amount: otherstocking.cost,
        receipt: file.name,
        receiptNo: otherstocking.invoiceNo,
        paidto: supplier.fullname,
        otherstockingId: otherstocking.id,
        otherstockId: otherstocking.otherstockId,
        userId: system_userid,
        otherstockname: otherstock.name,
      };
      if (otherstocking && otherstocking.receipt == null) {
        let afterUpload = async () => {
          await db.Otherstocking.update(
            { receipt: file.name },
            { where: { id: newExpense.otherstockingId } }
          );
          await db.Expense.create(newExpense);
          res.status(200).json({ msg: "Stock updated succesfully" });
          logger.info(
            `${system_user}| updated other stock ${newExpense.otherstockingId} for <${otherstock.id}> ${newExpense.otherstockname}`
          );
        };
        await fileUpload.stockfileupload(file, afterUpload, newExpense);
      } else if (otherstocking && otherstocking.receipt != null) {
        let afterUpload = async () => {
          await db.Otherstocking.update(
            { receipt: file.name },
            { where: { id: newExpense.otherstockingId } }
          );
          await db.Expense.update(
            { receipt: file.name },
            { where: { otherstockingId: newExpense.otherstockingId } }
          );
          res.status(200).json({ msg: "Stock updated succesfully" });
          logger.info(
            `${system_user}| updated other stock  ${newExpense.otherstockingId} for <${otherstock.id}> ${newExpense.otherstockname}`
          );
        };
        await fileUpload.stockfileupload(file, afterUpload, newExpense);
      } else {
        res.status(404).json({ msg: "Record does not exist" });
        logger.info(
          `${system_user}| tried adding receipt to missing other stock item`
        );
      }
    } else {
      res.status(400).json({ msg: "No attached file" });
      logger.info(`${system_user}| uploaded empty reciept field`);
    }
  } catch (e) {
    res
      .status(500)
      .json({ msg: "Error occurred, try again or contact support" });
    logger.error(
      `${system_user}| Could not upload otherstock receipt due to: ${e}`
    );
  }
};

const updateotherstocking = async (req, res) => {
  let otherstocking = await db.Otherstocking.findByPk(req.params.id);
  if (otherstocking) {
    let expense = await db.Expense.findOne({
      where: { otherstockingId: otherstocking.id },
    });
    let otherstock = await db.Otherstock.findByPk(otherstocking.otherstockId);
    try {
      await db.Otherstocking.update(
        {
          ...req.body,
          otherstockId: req.body.otherstock,
          supplierId: req.body.supplier,
        },
        {
          where: {
            id: otherstocking.id,
          },
        }
      );
      if (req.body.amount) {
        let difference =
          parseInt(req.body.amount) - parseInt(otherstocking.amount);
        let amount = parseInt(otherstock.amount) + parseInt(difference);
        console.log(amount);
        await db.Otherstock.update(
          { amount: amount },
          {
            where: {
              id: otherstock.id,
            },
          }
        );
      }
      if (expense && req.body.cost) {
        await db.Otherstocking.update(
          { adjusted: true },
          {
            where: {
              id: otherstocking.id,
            },
          }
        );
        await db.Expense.update(
          { receiptNo: req.body.invoiceNo },
          { where: { id: expense.id } }
        );
        await db.Adjustment.create({
          amount: req.body.cost - expense.amount,
          expenseId: expense.id,
        });
      }

      res.status(200).json({ msg: "Stock item updated succesfully" });
      logger.info(
        `${system_user}| updated stock for <${otherstock.id}> ${otherstock.name}`
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

// do not create endpoint
const deleteotherstocking = async (req, res) => {
  let otherstocking = await db.Otherstocking.findByPk(req.params.id);
  if (otherstocking) {
    let otherstock = await db.Otherstock.findByPk(otherstocking.otherstockId);
    let expense = await db.Expense.findOne({
      where: { otherstockingId: otherstocking.id },
    });
    try {
      let amount =
        parseFloat(otherstock.amount) - parseFloat(otherstocking.amount);
      await db.Otherstocking.update(
        {
          adjusted: true,
          description: "deleted",
          cost: 0,
          quantity: 0,
          invoiceNo: "",
        },
        { where: { id: req.params.id } }
      );
      await db.Otherstock.update(
        { amount: amount },
        { where: { id: otherstock.id } }
      );
      if (expense) {
        await db.Adjustment.create({
          amount: 0 - parseFloat(expense.amount),
          expenseId: expense.id,
        });
      }
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
      include: [
        { model: db.Supplier },
        { model: db.Otherstock },
        { model: db.User, attributes: ["username"] },
        { model: db.Expense },
      ],
    });
    if (otherstocking) {
      res.status(200).send(otherstocking);
      logger.info(
        `${system_user}| fetched item stocking ${otherstocking.id} for <${otherstocking.Otherstock.id}> ${otherstocking.Otherstock.name}`
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
      include: [
        { model: db.Supplier },
        { model: db.Otherstock },
        { model: db.User, attributes: ["username"] },
        { model: db.Expense },
      ],
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

const getallotherstocking = async (req, res) => {
  try {
    let otherstockings = await db.Otherstocking.findAll({
      order: [["createdAt", "DESC"]],
      include: [{ model: db.Supplier }, { model: db.Otherstock }],
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

const consumeotherstock = async (req, res) => {
  try {
    let items  = req.body,
      someError = false;
    await items.forEach(async (item) => {
      let otherstock = await db.Otherstock.findByPk(item.otherstock);
      if (otherstock && otherstock.amount >= parseInt(item.quantity)) {
        let amount = parseInt(otherstock.amount) - parseInt(item.quantity);
        db.Otherstock.update(
          { amount: amount },
          { where: { id: item.otherstock } }
        );
        db.Stockutil.create({
          otherstockId: item.otherstock,
          quantity: parseInt(item.quantity),
          userId: system_userid,
        });
        logger.info(
          `${system_user} spend stock ${otherstock.name} | ${otherstock.description} <${item.otherstock}>`
        );
      } else {
        someError = true;
      }
    });
    if (!someError) {
      res.status(200).json({ msg: "Stock Updated Successfully" });
    } else {
      res
        .status(400)
        .json({ msg: "Some items could be updated for some reason" });
    }
  } catch (e) {
    res
      .status(500)
      .json({ msg: "Error occurred, try again or contact support" });
    logger.error(
      `${system_user}| Could not consume other items in stock due to: ${e}`
    );
  }
};

// realeasing stock
// assign stock
const assignstock = async (req, res) => {
  let allrealeased = await db.Releasedstock.findAll({
      where: { quantity: { [Op.gte]: 0 } },
    }),
    package = await db.Package.findByPk(req.body.package);
  let sumreleased = 0;
  allrealeased.forEach((element) => {
    return (sumreleased = sumreleased + element.quantity);
  });
  let remaining =
    parseInt(package.number) - sumreleased - parseInt(req.body.quantity);
  if (remaining >= 0) {
    if (req.body.retailer) {
      try {
        let retailer = await db.Retailer.findByPk(req.body.retailer);
        if (retailer) {
          let newassignment = {
            name: req.body.name,
            description: req.body.description,
            quantity: parseInt(req.body.quantity),
            packageId: req.body.package,
            retailerId: req.body.retailer,
          };
          await db.Releasedstock.create(newassignment);
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
        let user = await db.User.findOne({
          where: { username: req.body.user },
        });
        if (user) {
          let newassignment = {
            name: req.body.name,
            description: req.body.description,
            quantity: parseInt(req.body.quantity),
            packageId: req.body.package,
            userId: user.id,
          };
          await db.Releasedstock.create(newassignment);
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
  } else {
    res.status(400).json({ msg: "No stock to assign" });
    logger.info(
      `${system_user}| attempted to assign absent stock to missing user`
    );
  }
};
// undo assign
const undoassignstock = async (req, res) => {
  try {
    let assigned = await db.Releasedstock.findByPk(req.params.id);
    if (assigned) {
      let quantity = parseInt(assigned.quantity) - parseInt(req.body.quantity);
      if (quantity >= 0) {
        await db.Releasedstock.update(
          { quantity: quantity },
          { where: { id: req.params.id } }
        );
        res.status(200).json({ msg: "assignment ammended successfully" });
        logger.info(
          `${system_user}| ammended a stock assignement to ${assigned.UserId}`
        );
      } else {
        res.status(404).json({ msg: "Assignement does not exist" });
        logger.info(`${system_user}| attempted to ammend missing assignment`);
      }
    } else {
      res
        .status(400)
        .json({ msg: "You cant release more than" + assigned.quantity });
      logger.info(
        `${system_user}| attempted to assign absent stock to missing user`
      );
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
    let assigned = await db.Releasedstock.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        { model: db.Package },
        { model: db.Retailer },
        { model: db.User, attributes: ["username"] },
      ],
    });
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

const getuserassignedstock = async (req, res) => {
  try {
    let assigned = await db.Releasedstock.findAll({
      where: {
        [Op.or]: [{ UserId: req.params.id }, { retailerId: req.params.id }],
      },
      include: { model: db.Package },
    });
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
  getallstocking,
  packageproduct,
  deletepackaging,
  getallpackaging,
  getonepackaging,
  purchaseotherstock,
  updateotherstocking,
  uploadOtherstockreceipt,
  deleteotherstocking,
  getoneotherstocking,
  getallotherstockingdetailed,
  getallotherstocking,
  assignstock,
  undoassignstock,
  getassignedstock,
  getuserassignedstock,
  consumeotherstock,
};
