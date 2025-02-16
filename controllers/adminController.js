const Grocery = require('../models/groceryModel');
const { sequelize, argon2, QueryTypes } = require('../config/db');
exports.addGrocery = async (req, res) => {
    try {
        const { name, price, stock } = req.body;

        // Check if the item already exists (case-insensitive)
        const [existingItem] = await sequelize.query(
            `SELECT * FROM grocery WHERE LOWER(name) = LOWER(?)`,
            { replacements: [name], type: sequelize.QueryTypes.SELECT }
        );

        if (existingItem) {
            return res.status(400).json({ message: "Item already exists" });
        }

        // Raw SQL query with named placeholders
        const query = `
          INSERT INTO grocery (name, price, stock, "created_at", "updated_at") 
          VALUES (:name, :price, :stock, NOW(), NOW()) 
          RETURNING *;
      `;

        // Execute the query with replacements
        const [grocery] = await sequelize.query(query, {
            replacements: { name, price, stock },
            type: sequelize.QueryTypes.INSERT,
        });

        if (grocery) {
            res.status(201).json({ message: "Grocery item added successfully!", grocery });
        }

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Failed to add grocery item", error: error.message });
    }
};



exports.viewGroceries = async (req, res) => {
    try {
        const [groceries] = await sequelize.query('SELECT * FROM "grocery";'); // Ensure table name is correct
        res.json(groceries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve groceries' });
    }
};


exports.updateGrocery = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, stock } = req.body;

        // Check if the grocery exists
        const [existingGrocery] = await sequelize.query(
            'SELECT * FROM "grocery" WHERE id = ?',
            { replacements: [id], type: sequelize.QueryTypes.SELECT }
        );

        if (!existingGrocery) {
            return res.status(404).json({ error: 'Grocery not found' });
        }

        // Check if the new name already exists (excluding the current item)
        const [duplicateGrocery] = await sequelize.query(
            'SELECT * FROM "grocery" WHERE LOWER(name) = LOWER(?) AND id != ?',
            { replacements: [name, id], type: sequelize.QueryTypes.SELECT }
        );

        if (duplicateGrocery) {
            return res.status(400).json({ error: 'Item with this name already exists' });
        }

        // Update the grocery item
        await sequelize.query(
            'UPDATE "grocery" SET name = ?, price = ?, stock = ? WHERE id = ?',
            { replacements: [name, price, stock, id] }
        );

        // Fetch the updated grocery
        const [updatedGrocery] = await sequelize.query(
            'SELECT * FROM "grocery" WHERE id = ?',
            { replacements: [id], type: sequelize.QueryTypes.SELECT }
        );

        res.json(updatedGrocery);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to update grocery item' });
    }
};


exports.deleteGrocery = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the grocery exists
        const [grocery] = await sequelize.query(
            'SELECT * FROM "grocery" WHERE id = ?',
            { replacements: [id], type: sequelize.QueryTypes.SELECT }
        );

        if (!grocery) return res.status(404).json({ message: 'Grocery not found' });

        // Delete the grocery item
        const [result] = await sequelize.query(
            'DELETE FROM "grocery" WHERE id = ?',
            { replacements: [id] }
        );

        if (result.rowCount === 0) return res.status(404).json({ message: 'Grocery not found' });

        res.status(200).json({ message: 'Grocery deleted successfully' });
    } catch (error) {
        console.error('error:', error);
        res.status(500).json({ message: 'Error deleting grocery item', error: error.message });
    }

}