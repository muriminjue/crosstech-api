"use strict";
const { Model } = require("sequelize");
// I think this is for stock items spent
module.exports = (sequelize, DataTypes) => {
  class Releasedstock extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Package, User, Retailer }) {
      // define association here
      this.belongsTo(Package, {
        foreignKey: "packageId",
      });
      this.belongsTo(User, {
        foreignKey: "userId",
      });
      this.belongsTo(Retailer, {
        foreignKey: "retailerId",
      });
    }
  }
  Releasedstock.init(
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
      quantity: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      tableName: "releasedstocks",
      modelName: "Releasedstock",
    }
  );
  return Releasedstock;
};
