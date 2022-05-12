"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Stockutils extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Otherstock, User }) {
      // define association here
      this.belongsTo(Otherstock, {
        foreignKey: "otherstockId",
      });
      this.belongsTo(User, {
        foreignKey: "userId",
      });
    }
  }
  Stockutils.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "stockutils",
      modelName: "Stockutil",
    }
  );
  return Stockutils;
};
