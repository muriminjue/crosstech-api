const dotenv = require("dotenv");

const db = require("../models");
const fileupload = require("../services/fileupload");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
const logger = require("../config/logger");

dotenv.config();

const addone = async (req, res) => {
  let newStaff = {
    name: req.body.name,
    natid: req.body.natid,
    email: req.body.email,
    phone: req.body.phone,
    salary: req.body.salary,
    designation: req.body.designation,
  };
  try {
    let staff = await db.Staff.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (!staff) {
      await db.Staff.create(newStaff);
      res.status(200).json({
        msg: "staff added succesfuly",
      });
      logger.info(`${system_user}| Added a staff record: ${req.body.email}`);
    } else {
      res.status(400).json({
        msg: "staff already exists",
      });
      logger.info(
        `${system_user}| attempted to add an existing staff record:  ${req.body.email}`
      );
      return;
    }
  } catch (error) {
    res.status(500).json({
      msg: "Error occurred while adding staff, try again or contact support",
    });
    logger.error(
      `${system_user}| Adding staff record encountered error: ${error}`
    );
  }
};

const getone = async (req, res) => {
  try {
    //let id = req.params.id,
    let staff = await db.Staff.findOne({
      where: {
        email: req.params.email,
      },
      include: { model: db.User },
    });
    if (staff) {
      res.send(staff).status(200);
      logger.info(
        `${system_user}| requested a staff record: ${req.params.email}`
      );
    } else {
      res.status(404).json({ msg: "staff does not exist" });
      logger.info(
        `${system_user}| requested a none existent staff record: ${req.params.email}`
      );
    }
  } catch (error) {
    logger.error(
      `${system_user}| requesting ${req.params.email} staff record encountered error: ${error}`
    );
    res.status(500).json({
      msg: "encountered an error fetching staff, try again or contact support",
    });
  }
};

const getall = async (req, res) => {
  try {
    let staff = await db.Staff.findAll({
      order: [["createdAt", "DESC"]],
    });
    if (staff.length != 0) {
      res.send(staff).status(200);
      logger.info(`${system_user}| Requested all staff record`);
    } else {
      res.status(404).json({ msg: "No staff to display" });
      logger.info(`${system_user}| requested staff record got zero record`);
    }
  } catch (error) {
    logger.error(
      `${system_user}| requesting staff record encountered error: ${error}`
    );
    res.status(500).json({
      msg: "encountered an error fetching staff, try again or contact support",
    });
  }
};

const editone = async (req, res) => {
  //handle image first
  let staff = await db.Staff.findOne({
    where: {
      email: req.params.email,
    },
  });

  if (staff) {
    if (req.files != null) {
      let file = req.files.image;
      if (imageMimeTypes.includes(file.mimetype)) {
        await fileupload(file);
        await db.Staff.update(
          { image: file.name },
          {
            where: {
              email: req.params.email,
            },
          }
        );
      } else {
        res.status(400).json({ msg: "Wrong file format" });
        logger.info(
          `${system_user}| Attempted to upload wrong user image format`
        );
      }
    }
    //then handle other data
    let formdata = req.body;
    try {
      await db.Staff.update(formdata, {
        where: {
          email: req.params.email,
        },
      });
      res.status(200).json({ msg: "update successful" });
      logger.info(
        `${system_user}| updated staff details for: ${req.params.email}`
      );
    } catch (error) {
      logger.error(
        `${system_user}| Updating staff record encountered error: ${error}`
      );
      res.status(500).json({
        msg: "encountered an error updating staff, try again or contact support",
      });
    }
  } else {
    res.status(404).json({ msg: "staff not found" });
    logger.info(
      `${system_user}| Tried editing staff non existent staff record: ${req.params.email}`
    );
  }
};

const deleteone = async (req, res) => {
  let staff = await db.Staff.findAll({
    where: {
      email: req.params.email,
    },
  });
  if (staff.length != 0) {
    staff.forEach(async (staff) => {
      try {
        logger.info(`${system_user}| deleting staff: ${staff.email}`);
        await db.Staff.destroy({ where: { id: staff.id } });
      } catch (error) {
        logger.error(
          `${system_user}| Deleting: <${req.params.email}> encountered error: ${error}`
        );
        res.status(500).json({
          msg: "encountered an error deleting staff, try again or contact support",
        });
      }
    });
    res.status(200).json({ msg: `staff deleted successfuly` });
  } else {
    logger.info(
      `${system_user}| Tried deleting a non existent staff: ${req.params.email}`
    );
    res.status(404).json({ msg: "staff not found" });
  }
};

module.exports = { addone, getone, getall, editone, deleteone };
