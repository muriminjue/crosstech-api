"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Sales extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Purchase, Package, Product, User, Customer, Retailer }) {
      // define association here
      this.belongsTo(Purchase, {
        foreignKey: "purchaseId",
      });
      this.belongsTo(Package, {
        foreignKey: "packageId",
      });
      this.belongsTo(Product, {
        foreignKey: "productId",
      });
      this.belongsTo(User, {
        foreignKey: "userId",
      });
      this.belongsTo(Customer, {
        foreignKey: "customerId",
      });
      this.belongsTo(Retailer, {
        foreignKey: "retailerrId",
      });
    }
  }
  Sales.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      pkgquantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      total: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "sales",
      modelName: "Sale",
    }
  );
  return Sales;
};
