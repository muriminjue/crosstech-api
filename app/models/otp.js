'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class otp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate() {
      // define association here
       }
  }
  otp.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: false,
      },
   
  }, {
    sequelize,
    modelName: 'Otp',
    tableName: 'otp'
  });
  return otp;
};