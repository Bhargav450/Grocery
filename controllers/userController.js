const Grocery = require('../models/groceryModel');
const Order = require('../models/orderModel');
const { sequelize, argon2, QueryTypes } = require('../config/db');

exports.viewAvailableGroceries = async (req, res) => {
  try {
    const [groceries] = await sequelize.query(
      `SELECT * FROM grocery WHERE stock > 0`
    );
    res.json(groceries);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to retrieve groceries' });
  }
};

exports.placeOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { userId, items } = req.body;
    let totalPrice = 0;
    let processedItems = [];

    for (const item of items) {
      // Fetch grocery item with FOR UPDATE lock
      const [grocery] = await sequelize.query(
        'SELECT * FROM "grocery" WHERE id = ? FOR UPDATE',
        { replacements: [item.groceryId], type: sequelize.QueryTypes.SELECT, transaction }
      );

      // Check if grocery item exists
      if (!grocery) {
        await transaction.rollback();
        return res.status(400).json({ error: `Grocery item with ID ${item.groceryId} does not exist` });
      }

      // Check stock availability
      if (grocery.stock < Number(item.quantity)) {
        await transaction.rollback();
        return res.status(400).json({ error: `Not enough stock for ${grocery.name}` });
      }

      const itemPrice = Number(grocery.price);
      const itemQuantity = Number(item.quantity);
      
      if (isNaN(itemPrice) || isNaN(itemQuantity)) {
        await transaction.rollback();
        return res.status(400).json({ error: `Invalid price or quantity for ${grocery.name}` });
      }

      totalPrice += itemPrice * itemQuantity;

      // Save processed item details for order_items insertion later
      processedItems.push({
        groceryId: item.groceryId,
        quantity: itemQuantity,
        price: itemPrice * itemQuantity
      });

      // Update grocery stock
      await sequelize.query(
        'UPDATE "grocery" SET stock = stock - ? WHERE id = ?',
        { replacements: [itemQuantity, item.groceryId], transaction }
      );
    }

    // Insert new order
    const [order] = await sequelize.query(
      'INSERT INTO "orders" (user_id, total_price, "created_at") VALUES (?, ?, NOW()) RETURNING id',
      { replacements: [userId, totalPrice], type: sequelize.QueryTypes.INSERT, transaction }
    );

    const orderId = order[0].id;

    // Insert order items
    for (const item of processedItems) {
      console.log({
        orderId,
        groceryId: item.groceryId,
        quantity: item.quantity,
        price: item.price,
      });

      await sequelize.query(
        'INSERT INTO "order_items" (order_id, grocery_id, quantity, price) VALUES (?, ?, ?, ?)',
        { 
          replacements: [orderId, item.groceryId, item.quantity, item.price], 
          transaction 
        }
      );
    }

    await transaction.commit();
    res.status(201).json({ message: "Order placed successfully", orderId });
  } catch (error) {
    await transaction.rollback();
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to place order" });
  }
};


