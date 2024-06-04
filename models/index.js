const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Configurar Sequelize para usar SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../data/database.sqlite')
});

// Definir el modelo SensorData
const SensorData = sequelize.define('SensorData', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    columnName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dataType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pattern: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

// Sincronizar el modelo con la base de datos
sequelize.sync();

module.exports = {
    sequelize,
    SensorData
};
