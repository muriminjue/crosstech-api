"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Package extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Product, Packaging, Sale, Otherstock, Releasedstock }) {
      // define association here
      this.belongsTo(Product, {
        foreignKey: "productId",
      });

      this.hasMany(Otherstock, {
        foreignKey: "packageId",
      });
      this.hasMany(Packaging, {
        foreignKey: "packageId",
      });
      this.hasMany(Sale, {
        foreignKey: "packageId",
      });
      this.hasMany(Releasedstock, {
        foreignKey: "packageId",
      });
    }
  }
  Package.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      quantity: {
        // denomination amount
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      number: {
        // items count
        allowNull: false,
        defaultValue: 0,
        type: DataTypes.INTEGER,
      },
      price: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
    },
    {
      sequelize,
      tableName: "packages",
      modelName: "Package",
    }
  );
  return Package;
};
