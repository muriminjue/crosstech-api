"use strict";
const { Model } = require("sequelize");
const PROTECTED_ATTRIBUTES = ["password"];
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
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

    static associate({
      Sale,
      Packaging,
      Purchase,
      Stocking,
      Staff,
      Otherstocking,
      Releasedstock,
      Userroles,
      Expense,
    }) {
      // define association here
      this.belongsTo(Staff, {
        foreignKey: "username",
        targetKey: "email",
      });
      this.hasMany(Stocking, {
        foreignKey: "userId",
      });

      this.hasMany(Packaging, {
        foreignKey: "userId",
      });
      this.hasMany(Sale, {
        foreignKey: "userId",
      });
      this.hasMany(Purchase, {
        foreignKey: "userId",
      });
      this.hasMany(Otherstocking, {
        foreignKey: "userId",
      });
      this.hasMany(Releasedstock, {
        foreignKey: "userId",
      });
      this.hasMany(Userroles, {
        foreignKey: "username",
        targetKey: "username",
        onDelete: "cascade",
        onUpdate: "cascade",
      });
      this.hasMany(Expense, {
        foreignKey: "userId",
      });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "users",
      modelName: "User",
    }
  );
  return User;
};
