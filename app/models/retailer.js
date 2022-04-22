"use strict";
const { Model } = require("sequelize");
const PROTECTED_ATTRIBUTES = ["password", "tocken"]
module.exports = (sequelize, DataTypes) => {
  class Retailers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    toJSON() {
      // hide protected fields
      let attributes = Object.assign({}, this.get());
      for (let a of PROTECTED_ATTRIBUTES) {
        delete attributes[a];
      }
      return attributes;
    }
    static associate({ Sale, Purchase, Releasedstock }) {
      // define association here
      this.hasMany(Releasedstock, {
        foreignKey: "retailerId",
      });
      this.hasMany(Purchase, {
        foreignKey: "retailerId",
      });
      this.hasMany(Sale, {
        foreignKey: "retailerId",
      });
    }
  }
  Retailers.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      fullname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contact: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      company: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pinNo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tocken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "retailers",
      modelName: "Retailer",
    }
  );
  return Retailers;
};
