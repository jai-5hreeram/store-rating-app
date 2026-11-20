
require('dotenv').config();

const readline = require('readline');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => {
        rl.question(question, resolve);
    });
}

async function createAdmin() {
    try {
        console.log('\nCreate Administrator Account\n');

        const name = (await ask('Enter admin name: ')).trim();
        const email = (await ask('Enter admin email: ')).trim().toLowerCase();
        const address = (await ask('Enter admin address: ')).trim();
        const password = await ask('Enter admin password: ');

        if (name.length < 20 || name.length > 60) {
            console.log('Name must contain 20-60 characters.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            console.log('Please enter a valid email.');
            return;
        }

        if (!address || address.length > 400) {
            console.log('Please enter a valid address.');
            return;
        }

        const passwordPattern = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordPattern.test(password)) {
            console.log('Password must be 8-16 characters with an uppercase letter and special character.');
            return;
        }

        const [existingUser] = await db.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            console.log('An account with this email already exists.');
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.execute(
            `INSERT INTO users (name, email, password, address, role)
             VALUES (?, ?, ?, ?, 'admin')`,
            [name, email, hashedPassword, address]
        );

        console.log('\nAdministrator account created successfully!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        rl.close();
        await db.end();
    }
}

createAdmin();
