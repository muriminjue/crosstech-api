"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Stockings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Supplier, Product, User }) {
      // define association here
      this.belongsTo(Supplier, {
        foreignKey: "supplierId",
      });
      this.belongsTo(Product, {
        foreignKey: "productsId",
      });
      this.belongsTo(User, {
        foreignKey: "userId",
      });
    }
  }
  Stockings.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      quantity: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      invoiceNo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      receipt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "stockings",
      modelName: "Stocking",
    }
  );
  return Stockings;
};
