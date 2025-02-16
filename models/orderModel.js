const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./userModel");

const Order = sequelize.define("Order", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
}, { timestamps: true });

Order.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

module.exports = Order;
