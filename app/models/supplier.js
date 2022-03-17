"use strict";
const {
    Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Suppliers extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate({
            Otherstocking,
            Stocking
        }) {
            // define association here
            this.hasMany(Stocking, {
                foreignKey: "supplierId"
            });
            this.hasMany(Otherstocking, {
                foreignKey: "supplierId"
            });
        }
    }
    Suppliers.init({
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
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        pinNo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        Location: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    }, {
        sequelize,
        tableName: "suppliers",
        modelName: "Supplier",
    });
    return Suppliers;
};