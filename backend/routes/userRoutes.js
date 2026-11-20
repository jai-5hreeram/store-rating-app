
const express = require('express');
const db = require('../config/db');
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyToken, allowRoles('user'));


// 1. View Stores, Search and Sort
router.get('/stores', async (req, res) => {
    try {
        const { name, address, sortBy, order } = req.query;

        let sql = `
            SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                COALESCE(ROUND(AVG(all_ratings.rating), 2), 0) AS averageRating,
                MAX(my_rating.rating) AS userRating
            FROM stores s
            LEFT JOIN ratings all_ratings
                ON s.id = all_ratings.store_id
            LEFT JOIN ratings my_rating
                ON s.id = my_rating.store_id
                AND my_rating.user_id = ?
            WHERE 1 = 1
        `;

        const values = [req.user.id];

        if (name) {
            sql += ' AND s.name LIKE ?';
            values.push(`%${name}%`);
        }

        if (address) {
            sql += ' AND s.address LIKE ?';
            values.push(`%${address}%`);
        }

        sql += ' GROUP BY s.id';

        const sortColumns = {
            name: 's.name',
            address: 's.address',
            averageRating: 'averageRating'
        };

        const sortColumn = sortColumns[sortBy] || 's.name';
        const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

        sql += ` ORDER BY ${sortColumn} ${sortOrder}`;

        const [stores] = await db.execute(sql, values);

        res.json(stores);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to fetch stores'
        });
    }
});


// 2. Submit or Update Rating
router.post('/stores/:id/rating', async (req, res) => {
    try {
        const storeId = Number(req.params.id);
        const { rating } = req.body;

        if (!Number.isInteger(storeId) || storeId <= 0) {
            return res.status(400).json({
                message: 'Invalid store ID'
            });
        }

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                message: 'Rating must be a whole number between 1 and 5'
            });
        }

        const [stores] = await db.execute(
            'SELECT id FROM stores WHERE id = ?',
            [storeId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                message: 'Store not found'
            });
        }

        await db.execute(
            `INSERT INTO ratings (user_id, store_id, rating)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE rating = ?`,
            [req.user.id, storeId, rating, rating]
        );

        res.json({
            message: 'Rating submitted or updated successfully'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to submit rating'
        });
    }
});

module.exports = router;
