const { verifyToken } = require('../middleware/authMiddleware');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, address, password } = req.body;

        // Check for empty fields
        if (!name || !email || !address || !password) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        const userName = name.trim();
        const userEmail = email.trim().toLowerCase();
        const userAddress = address.trim();

        // Validate name
        if (userName.length < 20 || userName.length > 60) {
            return res.status(400).json({
                message: 'Name must be between 20 and 60 characters'
            });
        }

        // Validate address
        if (userAddress.length > 400) {
            return res.status(400).json({
                message: 'Address cannot exceed 400 characters'
            });
        }

        // Validate email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(userEmail)) {
            return res.status(400).json({
                message: 'Please enter a valid email'
            });
        }

        // Validate password
        const passwordPattern = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordPattern.test(password)) {
            return res.status(400).json({
                message: 'Password must be 8-16 characters and contain at least one uppercase letter and one special character'
            });
        }

        // Check whether email already exists
        const [existingUser] = await db.execute(
            'SELECT id FROM users WHERE email = ?',
            [userEmail]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: 'Email is already registered'
            });
        }

        // Encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const [result] = await db.execute(
            `INSERT INTO users (name, email, password, address, role)
             VALUES (?, ?, ?, ?, 'user')`,
            [userName, userEmail, hashedPassword, userAddress]
        );

        res.status(201).json({
            message: 'Registration successful',
            userId: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Something went wrong during registration'
        });
    }
});


// User Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const userEmail = email.trim().toLowerCase();

        // Find user by email
        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [userEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Something went wrong during login'
        });
    }
});


// Change Password
router.put('/change-password', verifyToken, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                message: 'Both passwords are required'
            });
        }

        const passwordPattern = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordPattern.test(newPassword)) {
            return res.status(400).json({
                message: 'New password must be 8-16 characters with an uppercase letter and special character'
            });
        }

        const [users] = await db.execute(
            'SELECT password FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const isValid = await bcrypt.compare(
            oldPassword,
            users[0].password
        );

        if (!isValid) {
            return res.status(401).json({
                message: 'Current password is incorrect'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        );

        res.json({
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to change password'
        });
    }
});


module.exports = router;
