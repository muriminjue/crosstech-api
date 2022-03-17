"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Otherstockings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Supplier, Otherstock, User }) {
      // define association here
      this.belongsTo(Supplier, {
        foreignKey: "supplierId",
      });
      this.belongsTo(Otherstock, {
        foreignKey: "otherstockId",
      });
      this.belongsTo(User, {
        foreignKey: "userId",
      });
    }
  }
  Otherstockings.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      invoiceNo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      number: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      receipt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      cost: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "otherstockings",
      modelName: "Otherstocking",
    }
  );
  return Otherstockings;
};
