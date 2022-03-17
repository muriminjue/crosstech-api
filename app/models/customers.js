"use strict";
const {
    Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Customers extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate({
            Sale,
            Purchase
        }) {
            // define association here
            this.hasMany(Sale, {
                foreignKey: "customerId"
            });
            this.hasMany(Purchase, {
                foreignKey: "customerId"
            })
        }
    }
    Customers.init({
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
        Contact: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Location: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        sequelize,
        tableName: "customers",
        modelName: "Customer",
    });
    return Customers;
};