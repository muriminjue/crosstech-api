"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Otherstock extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Package, Otherstocking, Expense }) {
      // define association here
      this.belongsTo(Package, {
        foreignKey: "packageId",
      });

      this.hasMany(Otherstocking, {
        foreignKey: "otherstockId",
      });
      this.hasMany(Expense, {
        foreignKey: "otherstockId",
      });
    }
  }
  Otherstock.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      description: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      units: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      number: {
        allowNull: true,
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: "otherstocks",
      modelName: "Otherstock",
    }
  );
  return Otherstock;
};
