const ejs = require("ejs");
const pdf = require("html-pdf");
const path = require("path");

const logger = require("../../config/logger");
const db = require("../../models");

const getnumber = (total) => {
  let number = "";
  for (let i = total.toString().length; i < 6; i++) {
    number += "0";
  }
  return number + (total + 1);
};

const genadj = async (req, res) => {
  let adjustments = await db.Adjustment.findAll(),
    total = parseInt(adjustments.length),
    adjnumb = await getnumber(total);

  ejs.renderFile(
    path.join(__dirname, "./templates/", "adjs.ejs"),
    { students: students },
    (err, data) => {
      if (err) {
        logger.error(`could not create adjustment template due to ${err}`);
        return err;
      } else {
        let options = {
          height: "11.25in",
          width: "8.5in",
          header: {
            height: "20mm",
          },
          footer: {
            height: "20mm",
          },
        };
        pdf
          .create(data, options)
          .toFile(`./temp/${adjnumb}.pdf`, function (err, data) {
            if (err) {
              logger.error(`could not create adjustment pdf due to ${err}`);
              return err;
            } else {
              return {
                filepath: `./temp/${adjnumb}.pdf`,
                filename: `${adjnumb}.pdf`,
                gennumber: adjnumb,
              };
            }
          });
      }
    }
  );
};

module.exports = { genadj };
