
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Only administrators can access these routes
router.use(verifyToken, allowRoles('admin'));


// 1. Admin Dashboard Statistics
router.get('/dashboard', async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT COUNT(*) AS totalUsers FROM users'
        );

        const [stores] = await db.execute(
            'SELECT COUNT(*) AS totalStores FROM stores'
        );

        const [ratings] = await db.execute(
            'SELECT COUNT(*) AS totalRatings FROM ratings'
        );

        res.json({
            totalUsers: users[0].totalUsers,
            totalStores: stores[0].totalStores,
            totalRatings: ratings[0].totalRatings
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to load dashboard' });
    }
});


// 2. Add a New User, Admin or Store Owner
router.post('/users', async (req, res) => {
    try {
        const { name, email, password, address, role } = req.body;

        if (!name || !email || !password || !address || !role) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        const userName = name.trim();
        const userEmail = email.trim().toLowerCase();
        const userAddress = address.trim();

        if (userName.length < 20 || userName.length > 60) {
            return res.status(400).json({
                message: 'Name must be between 20 and 60 characters'
            });
        }

        if (!userAddress) {
            return res.status(400).json({
                message: 'Address cannot be empty'
            });
        }

        if (userAddress.length > 400) {
            return res.status(400).json({
                message: 'Address cannot exceed 400 characters'
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
            return res.status(400).json({
                message: 'Invalid email address'
            });
        }

        const passwordPattern = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordPattern.test(password)) {
            return res.status(400).json({
                message: 'Password must be 8-16 characters with an uppercase letter and special character'
            });
        }

        const allowedRoles = ['admin', 'user', 'store_owner'];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: 'Invalid user role'
            });
        }

        const [existingUser] = await db.execute(
            'SELECT id FROM users WHERE email = ?',
            [userEmail]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: 'Email is already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            `INSERT INTO users (name, email, password, address, role)
             VALUES (?, ?, ?, ?, ?)`,
            [userName, userEmail, hashedPassword, userAddress, role]
        );

        res.status(201).json({
            message: 'User created successfully',
            userId: result.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create user' });
    }
});


// 3. Add a New Store
router.post('/stores', async (req, res) => {
    try {
        const { name, email, address, ownerId } = req.body;

        if (!name || !email || !address) {
            return res.status(400).json({
                message: 'Store name, email and address are required'
            });
        }

        if (!name.trim() || !address.trim()) {
            return res.status(400).json({
                message: 'Store name and address cannot be empty'
            });
        }


        if (name.trim().length > 100 || address.trim().length > 400) {
            return res.status(400).json({
                message: 'Store name or address is too long'
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return res.status(400).json({
                message: 'Invalid store email'
            });
        }

        if (ownerId !== undefined && ownerId !== null && ownerId !== '') {
            const [owners] = await db.execute(
                `SELECT id FROM users
                 WHERE id = ? AND role = 'store_owner'`,
                [ownerId]
            );

            if (owners.length === 0) {
                return res.status(400).json({
                    message: 'Selected store owner does not exist'
                });
            }
        }

        const [result] = await db.execute(
            `INSERT INTO stores (name, email, address, owner_id)
             VALUES (?, ?, ?, ?)`,
            [
                name.trim(),
                email.trim().toLowerCase(),
                address.trim(),
                ownerId || null
            ]
        );

        res.status(201).json({
            message: 'Store added successfully',
            storeId: result.insertId
        });

    } catch (error) {
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'This store owner already has a store'
            });
        }

        res.status(500).json({ message: 'Failed to add store' });
    }
});


// 4. View All Users with Search, Filters and Sorting
router.get('/users', async (req, res) => {
    try {
        const { name, email, address, role, sortBy, order } = req.query;

        let sql = `
            SELECT id, name, email, address, role, created_at
            FROM users
            WHERE 1 = 1
        `;

        const values = [];

        if (name) {
            sql += ' AND name LIKE ?';
            values.push(`%${name}%`);
        }

        if (email) {
            sql += ' AND email LIKE ?';
            values.push(`%${email}%`);
        }

        if (address) {
            sql += ' AND address LIKE ?';
            values.push(`%${address}%`);
        }

        if (role) {
            if (!['admin', 'user', 'store_owner'].includes(role)) {
                return res.status(400).json({
                    message: 'Invalid role filter'
                });
            }

            sql += ' AND role = ?';
            values.push(role);
        }

        const sortColumns = {
            name: 'name',
            email: 'email',
            address: 'address',
            role: 'role',
            created_at: 'created_at'
        };

        const sortColumn = sortColumns[sortBy] || 'name';
        const sortOrder = order && order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

        sql += ` ORDER BY ${sortColumn} ${sortOrder}`;

        const [users] = await db.execute(sql, values);

        res.json(users);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});


// 5. View All Stores with Ratings, Search and Sorting
router.get('/stores', async (req, res) => {
    try {
        const { name, email, address, sortBy, order } = req.query;

        let sql = `
            SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                o.name AS ownerName,
                COALESCE(ROUND(AVG(r.rating), 2), 0) AS averageRating
            FROM stores s
            LEFT JOIN users o ON s.owner_id = o.id
            LEFT JOIN ratings r ON s.id = r.store_id
            WHERE 1 = 1
        `;

        const values = [];

        if (name) {
            sql += ' AND s.name LIKE ?';
            values.push(`%${name}%`);
        }

        if (email) {
            sql += ' AND s.email LIKE ?';
            values.push(`%${email}%`);
        }

        if (address) {
            sql += ' AND s.address LIKE ?';
            values.push(`%${address}%`);
        }

        sql += ' GROUP BY s.id, o.id';

        const sortColumns = {
            name: 's.name',
            email: 's.email',
            address: 's.address',
            averageRating: 'averageRating'
        };

        const sortColumn = sortColumns[sortBy] || 's.name';
        const sortOrder = order && order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

        sql += ` ORDER BY ${sortColumn} ${sortOrder}`;

        const [stores] = await db.execute(sql, values);

        res.json(stores);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch stores' });
    }
});


// 6. View Individual User Details
router.get('/users/:id', async (req, res) => {
    try {
        const [users] = await db.execute(
            `SELECT id, name, email, address, role, created_at
             FROM users WHERE id = ?`,
            [req.params.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const user = users[0];

        if (user.role === 'store_owner') {
            const [stores] = await db.execute(
                `SELECT
                    s.id,
                    s.name,
                    s.email,
                    s.address,
                    COALESCE(ROUND(AVG(r.rating), 2), 0) AS averageRating
                 FROM stores s
                 LEFT JOIN ratings r ON s.id = r.store_id
                 WHERE s.owner_id = ?
                 GROUP BY s.id`,
                [user.id]
            );

            user.stores = stores;
        }

        res.json(user);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch user details' });
    }
});

module.exports = router;
