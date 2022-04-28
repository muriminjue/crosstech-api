"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Otherstockings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Supplier, Otherstock, User, Expense }) {
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
      this.hasMany(Expense, {
        foreignKey: "otherstockingId",
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
      amount: {
        allowNull: false,
        type: DataTypes.FLOAT,
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
      adjusted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
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
