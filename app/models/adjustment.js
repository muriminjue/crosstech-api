"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Adjustment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Expense, Purchase }) {
      // define association here
      this.belongsTo(Expense, {
        foreignKey: "expenseId",
      });
      this.belongsTo(Purchase, {
        foreignKey: "purchaseId",
      });
    }
  }
  Adjustment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      
    },
    {
      sequelize,
      tableName: "adjustments",
      modelName: "Adjustment",
    }
  );
  return Adjustment;
};
