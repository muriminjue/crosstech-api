const db = require("../models");
const logger = require("../config/logger");
const sendemail = require("../services/emailsender");

//modules
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const otpGenerator = require("otp-generator");
const generator = require("generate-password");
const axios = require("axios");

const salt = 12;
dotenv.config();
const allroles = [
  "admin",
  "systemaadmin",
  "product_man",
  "stock_man",
  "sales_man",
  "accounts_man",
];

const getroles = async (req, res) => {
  res.status(200).send(allroles);
  logger.info(` ${system_user}| requested all user roles`);
};

const adduser = async (req, res) => {
  let username = req.body.username,
    staff = await db.Staff.findOne({ where: { email: username } }),
    roles = req.body.roles;
  password = generator.generate({
    length: 10,
    uppercase: false,
  });
  if (!staff) {
    try {
      if (!username) {
        res.status(400).json({ msg: "Please select select a user" });
        logger.info(
          `${system_user}| attempted to create new user without  username`
        );
      } else {
        let admin = await db.User.findOne({ where: { username: username } });
        if (admin) {
          res.status(400).json({ msg: "user already exists" });
          logger.info(
            `${system_user}| tried to create existing user:  ${username}`
          );
        } else {
          await db.User.create({
            username: username,
            password: await bcrypt.hash(password, salt),
          });
          await db.Staff.update({ user: true }, { where: { email: username } });
          roles.forEach(async (element) => {
            await db.Userroles.create({
              roles: element,
              username: username,
            });
          });

          //makes edits after finishing emailing service
          let sentby = "",
            sendto = username,
            subject = "Login Details",
            text = `A user account has been created for you on this email. Login using \r\n password:  ${password} \r\n consider changing the password ofter logging in`;
          await sendemail(sentby, sendto, subject, text);
          res.status(200).json({
            msg: "User added succesfuly",
          });
          logger.info(`${system_user}| created new user: ${username}`);
        }
      }
    } catch (e) {
      res.status(500).json({
        msg: "Error occurred, try again or contact support",
      });
      logger.error(
        `${system_user}| Could not add user < ${username} >  due to: ${e}`
      );
    }
  } else {
    res.status(404).json({ msg: "Staff does not exist" });
    logger.info(`${system_user}| attempted to create new user for non-staff`);
  }
};

const login = async (req, res) => {
  let { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ msg: "Enter all credentials" });
    logger.info("login attempt made");
  } else {
    try {
      let admin = await db.User.findOne({
        where: { username: username },
        include: { model: db.Staff, model: db.Userroles },
      });
      if (!admin) {
        res.status(400).json({ msg: "user does not exist" });
        logger.info(`none existent user: ${username}, attempted login`);
      } else {
        let isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
          res.status(403).json({ msg: "Your password is Wrong" });
          logger.info(`${username} entered the wrong password`);
        } else {
          jwt.sign(
            { admin },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1hr" },
            (err, token) => {
              if (err) {
                res.status(500).json({ msg: "" });
                logger.error(`${username} encountered error ${err}`);
              } else {
                res.status(200).json({
                  token: token,
                  msg: "login success",
                  admin: admin,
                });
                logger.info(`${username} loggged in. Session started`);
              }
            }
          );
        }
      }
    } catch (e) {
      res.status(500).json({
        msg: "Error occurred, try again or contact support",
      });
      logger.error("Could not login user:" + username + "due to: " + e);
    }
  }
};

const sendotp = async (req, res) => {
  logger.info(`requested for otp for: <${req.body.username}>`);
  //must be a post funtion
  const user = await db.User.findOne({
    where: { username: req.body.username },
    include: { model: db.Staff },
  });
  if (user) {
    let otp = await otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      }),
      newotp = { username: user.username, phone: user.Staff.phone, otp: otp };

    if (req.body.usesms == true) {
      let sms = await db.Sms.create({
        email: newotp.username,
        phone: newotp.phone,
        message: `Your Otp is ${otp}. Do not share with anyone.`,
      });
      try {
        let config = {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: "Bearer " + process.env.SMSkey,
            },
          },
          data = {
            sender: "Crosstech",
            message: `Your Otp is ${otp}. Do not share with anyone.`,
            phone: newotp.phone,
            correlator: sms.dataValues.id,
            //endpoint: process.env.RESapi
          };
        await axios
          .post(process.env.SMSapi, data, config)
          .then(async function (response) {
            logger.info(newotp.phone + " " + response.data[0].message);
            res.status(200).json({
              msg: "Otp sms sent succesfuly",
            });
          })
          .catch(function (error) {
            res.status(500).json({
              msg: "Could not send otp via sms, try again or contact support",
            });
            logger.error("sms failed" + error);
          });

        logger.info("OTP Sent via Sms to: " + req.body.username);
      } catch (e) {
        res.status(500).json({
          msg: "Error occurred, try again or contact support",
        });
        logger.error("Could not sms OTP due to: " + e);
      }
    } else {
      try {
        let sentby = "",
          sendto = user.username,
          subject = "Crosstech Admin Password Reset",
          text = `Your OTP is ${otp}. Do not share with anyone. \r\n otp is valid for 15 minutes \r\n if it was not requested by you please ignore and email support`;
        await sendemail(sentby, sendto, subject, text);
        res.status(200).json({
          msg: "Otp emailed succesfuly",
        });
        logger.info("Otp Sent via email to: " + req.body.username);
      } catch (e) {
        res.status(500).json({
          msg: "Error occurred, try again or contact support",
        });
        logger.error("Could not email OTP due to: " + e);
      }
    }

    await db.Otp.create(newotp);
  } else {
    res.status(404).json({
      msg: "username does not exist",
    });
    logger.info("Otp requested for nonexistent user: " + req.body.username);
  }
};

const changepass = async (req, res) => {
  //must be the user
  let user = await db.Otp.findOne({ where: { otp: req.body.otp } }),
    username = req.params.username;
  if (user && user.username == username) {
    try {
      let password = await bcrypt.hash(req.body.password, salt);
      console.log(req.body.password, password);
      await db.User.update(
        { password: password },
        { where: { username: username } }
      );
      await db.Otp.destroy({ where: { otp: req.body.otp } });
      logger.info(`changed password for : ${username}`);
      res.status(200).json({ msg: `${username}changed password` });
    } catch (e) {
      res.status(500).json({
        msg: "Error occurred, try again or contact support",
      });
      logger.error(
        ` Could not update password for user: ${username} due to:  ${e}`
      );
    }
  } else {
    res.status(404).json({
      msg: "Otp or username is invalid/ expired",
    });
    logger.info(` used an otp or is not linked to otp`);
  }
};

const updatepass = async (req, res) => {
  try {
    let user = await db.User.findOne({
      where: { username: req.params.username },
      include: { model: db.Staff, model: db.Userroles },
    });
    if (user && user.username == system_user) {
      let isMatch = await bcrypt.compare(req.body.oldpassword, user.password);
      if (!isMatch) {
        res.status(403).json({ msg: "your password is incorrect" });
        logger.warn("tried changing password with wrong old password");
      } else {
        let password = bcrypt.hashSync(req.body.newpassword, parseInt(salt));
        await db.User.update(
          { password: password },
          { where: { email: req.params.username } }
        );
        res.status(200).json({ msg: "Password has been Updated" });
        logger.info(`${system_user}|Updated password`);
      }
    } else {
      res.status(403).json({ msg: "Not your account" });
      logger.warn(
        `${system_user}| tried changing password for other account ${req.params.username} `
      );
    }
  } catch (e) {
    res.status(500).json({ msg: "Error, try again" });
    logger.error(
      `${system_user}| Could not change their password due to: ${e}`
    );
  }
};

//can be done by  admin only
const deleteuser = async (req, res) => {
  let username = req.params.username,
    user = await db.User.findOne({ where: { username: username } });
  if (user) {
    try {
      await db.User.destroy({
        where: {
          username: username,
        },
      });
      await db.Staff.update({ user: false }, { where: { email: username } });
      res.status(200).json({
        msg: `${system_user}| deleted user: <${username}>  succesfully`,
      });
      logger.info(username + "deleted");
    } catch (e) {
      res
        .status(500)
        .json({ msg: "Error occurred, try again or contact support" });
      logger.error(
        `${system_user}| Could not delete user: <${username}> due to: ${e}`
      );
    }
  } else {
    res.status(404).json({ msg: "user does not exist" });
    logger.info(
      `${system_user}|  attemted to deleted nonexistent user:  <${username}>`
    );
  }
};

const checkauth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    res.status(401).json({ msg: "No Authorisation token" });
    logger.info("request without authorisation");
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        res.status(403).json({ msg: "Invalid Token, Access denied" });
        logger.info("Invalid Token, Access denied");
      } else {
        global.system_userid = user.admin.id;
        global.system_user = user.admin.username;
        next();
      }
    });
  }
};

//const getallusers = {}

module.exports = {
  adduser,
  login,
  checkauth,
  sendotp,
  changepass,
  updatepass,
  deleteuser,
  getroles,
};
