const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Order = require("./orderModel");
const Grocery = require("./groceryModel");

const OrderItem = sequelize.define("OrderItem", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
        },
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
}, { timestamps: true });

OrderItem.belongsTo(Order, { foreignKey: "order_id", onDelete: "CASCADE" });
OrderItem.belongsTo(Grocery, { foreignKey: "grocery_id", onDelete: "CASCADE" });

module.exports = OrderItem;
