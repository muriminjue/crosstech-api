"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Expenses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Stocking, Otherstocking, Product, Otherstock, User }) {
      // define association here
      this.belongsTo(Stocking, {
        foreignKey: "stockingId",
      });
      this.belongsTo(Otherstocking, {
        foreignKey: "otherstockingId",
      });
      this.belongsTo(Product, {
        foreignKey: "productId",
      });
      this.belongsTo(Otherstock, {
        foreignKey: "otherstockId",
      });
      this.belongsTo(User, {
        foreignKey: "userId",
      });
      
    }
  }
  Expenses.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      receiptNo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      receipt: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paidto: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "expenses",
      modelName: "Expense",
    }
  );
  return Expenses;
};
