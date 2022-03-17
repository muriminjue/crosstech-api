"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Purchases extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Sale, Customer, User, Retailer }) {
      // define association here
      this.belongsTo(Customer, {
        foreignKey: "customerId",
      });

      this.belongsTo(User, {
        foreignKey: "userId",
      });
      this.belongsTo(Retailer, {
        foreignKey: "retailerId",
      });
      this.hasMany(Sale, {
        foreignKey: "purchaseId",
      });
    }
  }
  Purchases.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      transacationId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      total: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      invoiceNo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "purchases",
      modelName: "Purchase",
    }
  );
  return Purchases;
};
