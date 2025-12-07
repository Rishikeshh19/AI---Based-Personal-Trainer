require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rashikesh2004:12345@ai-trainer.ztnqz.mongodb.net/ai_trainer?retryWrites=true&w=majority';

async function createAdminUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@example.com';
        const adminPassword = 'admin123456';
        const adminName = 'Admin User';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
            process.exit(0);
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const adminUser = new User({
            username: 'admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            profile: {
                firstName: 'Admin',
                lastName: 'User'
            }
        });

        await adminUser.save();
        console.log('✅ Admin user created successfully!');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);
        console.log('Role:', 'admin');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();
