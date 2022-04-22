const logger = require("../config/logger");
const db = require("../models");

// systemaadmin
const issystemadmin = async (req, res, next) => {
    try {
        let rights = await checkrights();
        if (rights == issystemadmin) {
          next();
        } else {
          res.status(403).json({ msg: "You have no access rights" });
          logger.warn(`${system_user}| tried accessing system admin`);
          return;
        }
      } catch (e) {
        res.status(500).json({ msg: "Error. Try again or contact support" });
        logger.error(`${system_user}| rights access failed`);
        return;
      }
};
// admin
const isadmin = async (req, res, next) => {
  try {
    let rights = await checkrights();
    if (rights == issystemadmin || rights == isadmin) {
      next();
    } else {
      res.status(403).json({ msg: "You have no access rights" });
      logger.warn(`${system_user}| tried accessing admin`);
      return;
    }
  } catch (e) {
    res.status(500).json({ msg: "Error. Try again or contact support" });
    logger.error(`${system_user}| rights access failed`);
    return;
  }
};

// product_man
const isproducts = async (req, res, next) => {
    try {
      let rights = await checkrights();
      if (rights == issystemadmin || rights == isadmin || rights == isproducts ) {
        next();
      } else {
        res.status(403).json({ msg: "You have no access rights" });
        logger.warn(`${system_user}| tried accessing products`);
        return;
      }
    } catch (e) {
      res.status(500).json({ msg: "Error. Try again or contact support" });
      logger.error(`${system_user}| rights access failed`);
      return;
    }
  };
// stock_man
const isstock = async  (req, res, next) => {
    try {
      let rights = await checkrights();
      if (rights == issystemadmin || rights == isadmin || rights == isstock ) {
        next();
      } else {
        res.status(403).json({ msg: "You have no access rights" });
        logger.warn(`${system_user}| tried accessing stock`);
        return;
      }
    } catch (e) {
      res.status(500).json({ msg: "Error. Try again or contact support" });
      logger.error(`${system_user}| rights access failed`);
      return;
    }
  };

// sales_man
const issales = async  (req, res, next) => {
    try {
      let rights = await checkrights();
      if (rights == issystemadmin || rights == isadmin || rights == issales) {
        next();
      } else {
        res.status(403).json({ msg: "You have no access rights" });
        logger.warn(`${system_user}| tried accessing sales`);
        return;
      }
    } catch (e) {
      res.status(500).json({ msg: "Error. Try again or contact support" });
      logger.error(`${system_user}| rights access failed`);
      return;
    }
  };

// accounts_man
const isaccounts = async  (req, res, next) => {
    try {
      let rights = await checkrights();
      if (rights == issystemadmin || rights == isadmin || rights == isaccounts) {
        next();
      } else {
        res.status(403).json({ msg: "You have no access rights" });
        logger.warn(`${system_user}| tried accessing accounts`);
        return;
      }
    } catch (e) {
      res.status(500).json({ msg: "Error. Try again or contact support" });
      logger.error(`${system_user}| rights access failed`);
      return;
    }
  };


const checkrights = async (req, res) => {
  try {
    let user = db.User.findByPk(system_userid, {
      include: { model: db.Userroles },
    });
    if (user.userroles.includes("systemadmin")) return issystemadmin;
    if (user.userroles.includes("admin")) return isadmin;
    if (user.userroles.includes("product_man")) return isproducts;
    if (user.userroles.includes("stock_man")) return isstock;
    if (user.userroles.includes("sales_man")) return issales;
    if (user.userroles.includes("accounts_man")) return isaccountss;
    else res.status(403).json({ msg: "No rights assigned" });
    logger.warn(`${system_user}| has no assigned rights`);
    return;
  } catch (e) {
    res.status(500).json({ msg: "Error. Try again or contact support" });
    logger.error(`${system_user}| could not confirm user rights`);
    return;
  }
};

let access = {issystemadmin,  isadmin, isaccounts, issales, isstock};

module.exports = access
