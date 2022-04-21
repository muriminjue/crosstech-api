//module
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const path = require("path");
const hbs = require("nodemailer-express-handlebars");

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.ehost,
  secureConnection: true,
  port: 465,
  auth: {
    user: process.env.euser,
    pass: process.env.epass,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

const options = {
  viewEngine: {
    layoutsDir: path.resolve("app/services/emails/layouts"),
    defaultLayout: "_main",
    extname: ".hbs",
  },
  extName: ".hbs",
  viewPath: path.resolve("app/services/emails/layouts"),
};

transporter.use("compile", hbs(options));

module.exports = transporter;
