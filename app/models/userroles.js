"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class userroles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User }) {
      // define association here
      this.belongsTo(User, {
        foreignKey: "username",
        sourceKey: "username",
      });
    }
  }
  userroles.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Userroles",
      tableName: "userroles",
    }
  );
  return userroles;
};
