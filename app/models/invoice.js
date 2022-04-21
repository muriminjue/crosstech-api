"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Purchase }) {
      // define association here
      this.belongsTo(Purchase, {
        foreignKey: "invoice",
        targetkey: "invoiceNo",
      });
    }
  }
  Invoice.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      invoicefile: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      receiptfile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "invoices",
      modelName: "Invoice",
    }
  );
  return Invoice;
};
