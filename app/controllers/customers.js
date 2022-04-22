const { Op } = require("sequelize");

const logger = require("../config/logger");
const db = require("../models");

const addone = async (req, res) => {
  let newcustomer = req.body;
  // fullname are mandatory fields
  try {
    let customer = await db.Customer.findOne({
      where: {
        [Op.or]: [
          { contact: req.body.contact || "" },
          { email: req.body.email || "" },
          { fullname: req.body.fullname },
        ],
      },
    });
    if (customer) {
      res.status(400).json({ msg: "Customer already exist" });
      logger.info(
        `${system_user}| attempted to add and existing customer record: ${req.body.fullname} ${req.body.contact}`
      );
    } else {
      await db.Customer.create(newcustomer);
      res.status(200).json({
        msg: "customer added succesfuly",
      });
      logger.info(
        `${system_user}| Added a customer record: ${req.body.fullname} ${req.body.contact}`
      );
    }
  } catch (e) {
    res.status(500).json({
      msg: "error occurred, try again or contact support",
    });
    logger.error(
      `${system_user}| Could not add customer  ${req.body.fullname} ${req.body.contact} + due to: ${e}`
    );
  }
};

const editone = async (req, res) => {
  let customer = await db.Customer.findByPk(req.params.id);
  try {
    if (customer) {
      await db.Customer.update(req.body,{where: {id: req.params.id }});
      logger.info(
        `${system_user}| Updated customer: ${customer.fullname} ${customer.id}`
      );
      res.status(200).json({ msg: "customer updated successfully" });
    } else {
      res.satus(404).json({ msg: "Customer does not exist" });
      logger.info(`${system_user}| attempted to edit a missing customer`);
    }
  } catch (e) {
    res.status(500).json({
      msg: "Error occurred, try again or contact support",
    });
    logger.error(`${system_user}| Could not edit customer due to:  ${e}`);
  }
};

const getall = async (req, res) => {
  let customers = await db.Customer.findAll();
  if (customers.length != 0) {
    try {
      res.status(200).send(customers);
      logger.info(`${system_user}| Requested all customer's list`);
    } catch (e) {
      res.status(500).json({
        msg: "Error occurred, try again or contact support",
      });
      logger.error(`${system_user}| Could not get all customers due to:  ${e}`);
    }
  } else {
    res.status(404).json({ msg: "No cusomers exist" });
    logger.info(`${system_user}| requested all customers and found no records`);
  }
};

const getalldetailed = async (req, res) => {
  let customers = await db.Customer.findAll({
    order: [["createdAt", "DESC"]],
    include: [{ model: db.Sale }, { model: db.Purchase }],
  });
  if (customers.length != 0) {
    try {
      res.status(200).send(customers);
      logger.info(`${system_user}| Requested all customers' list`);
    } catch (e) {
      res.status(500).json({
        msg: "Error occurred, try again or contact support",
      });
      logger.error(`${system_user}| Could not get all customers due to:  ${e}`);
    }
  } else {
    res.status(404).json({ msg: "No cusomers exist" });
    logger.info(`${system_user}| requested all customers and found no records`);
  }
};

const deleteone = async (req, res) => {
  let customer = await db.Customer.findByPk(req.params.id);
  try {
    if (customer) {
      await db.Customer.destroy({where: {id: req.params.id}});
      logger.info(
        `${system_user}| deleted customer: ${customer.fullname} ${customer.contact}`
      );
      res.status(200).json({ msg: "customer deleted successfully" });
    } else {
      res.status(404).json({ msg: "Customer does not exist" });
      logger.info(`${system_user}| attempted to delete a missing customer`);
    }
  } catch (e) {
    res.status(500).json({
      msg: "Error occurred, try again or contact support",
    });
    logger.error(`${system_user}| Could not delete customer due to:  ${e}`);
  }
};

const getone = async (req, res) => {
  try {
    let customer = await db.Customer.findByPk(req.params.id, {
      include: [{ model: db.Sale }, { model: db.Purchase }],
    });
    if (customer) {
      res.status(200).send(customer);
      logger.info(
        `${system_user}| requested and received customer ${req.params.id} details`
      );
    } else {
      res.status(404).json({ msg: "Customer doe not exist" });
      logger.info(`${system_user}| attempted to get a missing customer`);
    }
  } catch (e) {
    res.status(500).json({
      msg: "Error occurred, try again or contact support",
    });
    logger.error(`${system_user}| Could get one customer due to:  ${e}`);
  }
};

module.exports = {
  addone,
  getall,
  editone,
  deleteone,
  getalldetailed,
  getone,
};
