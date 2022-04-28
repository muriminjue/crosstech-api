"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Packagings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Package, Product, User }) {
      // define association here
      this.belongsTo(Package, {
        foreignKey: "packageId",
      });
      this.belongsTo(Product, {
        foreignKey: "productId",
      });
      this.belongsTo(User, {
        foreignKey: "userId",
      });
    }
  }
  Packagings.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      number: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      removed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "packagings",
      modelName: "Packaging",
    }
  );
  return Packagings;
};
