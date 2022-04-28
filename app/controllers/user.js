const db = require("../models");
const logger = require("../config/logger");
const sendemail = require("../services/emails/mailer");
const imagefileupload= require("../services/fileupload").imagefileupload;
const messaging = require("../services/sms");

//modules
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const otpGenerator = require("otp-generator");
const generator = require("generate-password");

dotenv.config();

const salt = 12;
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
const allroles = [
  "admin",
  "systemadmin",
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
    staff = await db.Staff.findOne({ where: { email: req.body.username } }),
    roles = req.body.roles;
  password = generator.generate({
    length: 10,
    uppercase: false,
  });
  if (staff) {
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
          let newuser = await db.User.create({
            username: username,
            password: await bcrypt.hash(password, salt),
          });
          await db.Staff.update({ user: true }, { where: { email: username } });
          await roles.forEach(async (element) => {
            try {
              await db.Userroles.create({
                role: element,
                username: username,
              });
              logger.info(
                `${system_user}|assigned role: ${element} to user: ${username}`
              );
            } catch (e) {
              logger.error(
                `${system_user}| assign role ${element} to user: ${username}`
              );
            }
          });
          res.status(200).json({
            msg: "User added succesfuly",
          });
          logger.info(`${system_user}| created new user: ${username}`);

          let email = {
            sendto: newuser.username,
            subject: "Login Details",
            template: "newuser",
            context: { password: password, today: new Date().toDateString() },
          };
          await sendemail(email);
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
        include: [{ model: db.Staff }, { model: db.Userroles }],
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
    let otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
   let newOtp = {
      username: user.username,
      phone: user.Staff.phone,
      otp: otp,
    };

    if (req.body.usesms == true) {
      try {
        let newsms = await db.Sms.create({
          email: newOtp.username,
          phone: newOtp.phone,
          message: `Your Otp is ${otp}. Do not share with anyone.`,
        });
        let data = {
          message: newsms.message,
          phone: newsms.phone,
          correlator: newsms.id,
        };
        let afterSend = [];
        afterSend.notsent = () => {
          res.status(500).json({ msg: "OTP text not sent" });
        };
        afterSend.hassent = () => {
          res.status(200).json({ msg: "otp sent via text" });
          logger.info("OTP Sent via Sms to: " + data.phone);
        };
        await messaging.sendSms(data, afterSend);
      } catch (e) {
        res.status(500).json({
          msg: "Error occurred, try again or contact support",
        });
        logger.error("Could not sms OTP due to: " + e);
      }
    } else {
      try {
        let email = {
          sendto: user.username,
          subject: "Password Reset",
          template: "otpsent",
          context: { otp: otp, today: new Date().toDateString() },
        };
        await sendemail(email);

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

    await db.Otp.create(newOtp);
  } else {
    res.status(404).json({
      msg: "username does not exist",
    });
    logger.info("Otp requested for nonexistent user: " + req.body.username);
  }
};

const otpchangepass = async (req, res) => {
  //must be the user
  let user = await db.Otp.findOne({ where: { otp: req.body.otp } }),
    username = req.params.username;
  if (user && user.username == username) {
    try {
      let password = await bcrypt.hash(req.body.password, salt);
      await db.User.update(
        { password: password },
        { where: { username: username } }
      );
      await db.Otp.destroy({ where: { otp: req.body.otp } });
      logger.info(`otp passworr change for : ${username}`);
      res.status(200).json({ msg: `${username} changed password` });
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
          { where: { username: req.params.username } }
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
        msg: "user: " + username + " deleted",
      });
      logger.info("${system_user}| deleted user: <${username}>  succesfully");
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
    return;
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        res.status(403).json({ msg: "Invalid Token, Access denied" });
        logger.info("Invalid Token, Access denied");
        return;
      } else {
        global.system_userid = user.admin.id;
        global.system_user = user.admin.username;
        next();
      }
    });
  }
};

const updateimage = async (req, res) => {
  try {
    let user = await db.User.findOne({
      where: { username: req.params.username },
    });
    if (user && user.username == system_user) {
      if (req.files != null) {
        let file = req.files.image;
        if (imageMimeTypes.includes(file.mimetype)) {
          await imagefileupload(file);
          await db.Staff.update(
            { image: file.name },
            {
              where: {
                email: req.params.username,
              },
            }
          );
          logger.info(`${system_user} succesfully updated user image`);
          res.status(200).json({ msg: "Image updated" });
        } else {
          res.status(400).json({ msg: "Wrong file format" });
          logger.info(
            `${system_user}| Attempted to upload wrong user image format`
          );
        }
      } else {
        res.status(400).json({ msg: "Please add a file upload" });
        logger.info(
          `${system_user}| Attempted to change user image with emtpty field`
        );
      }
    } else {
      res.status(400).json({ msg: "Not your user account" });
      logger.info(
        `${system_user}| Attempted to change user image for another user ${req.params.username}`
      );
    }
  } catch (e) {
    res
      .status(500)
      .json({ msg: "Error occurred, try again or contact support" });
    logger.error(
      `${system_user}| Could not updste their user image due to: ${e}`
    );
  }
};

const changeUseroles = async (req, res) => {
  try {
    let user = await db.User.findOne({
        where: { username: req.params.username },
      }),
      roles = req.body.roles;
    if (user) {
      await db.Userroles.destroy({ where: { username: req.params.username } });
      await roles.forEach(async (element) => {
        try {
          await db.Userroles.create({
            role: element,
            username: req.params.username,
          });
          logger.info(
            `${system_user}|assigned role: ${element} to user: ${req.params.username}`
          );
        } catch (e) {
          res
            .status(500)
            .json({ msg: "Error occurred, try again or contact support" });
          logger.error(
            `${system_user}| Could not update  user roles due to: ${e}`
          );
          return;
        }
      });
      res.status(200).json({ msg: "User roles updated" });
    } else {
      res.status(404).json({ msg: "User does not exist" });
      logger.info(
        `${system_user}| tried to update user roles for missing user ${req.body.username}`
      );
    }
  } catch (e) {
    res
      .status(500)
      .json({ msg: "Error occurred, try again or contact support" });
    logger.error(`${system_user}| Could not update user roles due to: ${e}`);
  }
};

module.exports = {
  adduser,
  login,
  checkauth,
  sendotp,
  otpchangepass,
  updatepass,
  deleteuser,
  getroles,
  updateimage,
  changeUseroles,
};
