
const express = require('express');
const db = require('../config/db');
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyToken, allowRoles('store_owner'));


// Store Owner Dashboard
router.get('/dashboard', async (req, res) => {
    try {
        // Find the store belonging to this owner
        const [stores] = await db.execute(
            'SELECT * FROM stores WHERE owner_id = ?',
            [req.user.id]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                message: 'No store has been assigned to your account'
            });
        }

        const store = stores[0];

        // Get average rating and total ratings
        const [summary] = await db.execute(
            `SELECT
                COALESCE(ROUND(AVG(rating), 2), 0) AS averageRating,
                COUNT(*) AS totalRatings
             FROM ratings
             WHERE store_id = ?`,
            [store.id]
        );

        // Get users who rated the store
        const [ratings] = await db.execute(
            `SELECT
                u.id AS userId,
                u.name,
                u.email,
                r.rating,
                r.updated_at
             FROM ratings r
             JOIN users u ON r.user_id = u.id
             WHERE r.store_id = ?
             ORDER BY r.updated_at DESC`,
            [store.id]
        );

        res.json({
            store: {
                id: store.id,
                name: store.name,
                address: store.address
            },
            averageRating: summary[0].averageRating,
            totalRatings: summary[0].totalRatings,
            ratings
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to load store owner dashboard'
        });
    }
});

module.exports = router;
