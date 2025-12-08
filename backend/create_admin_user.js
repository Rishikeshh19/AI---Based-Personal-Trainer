require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DATABASE_NAME || 'ai_trainer';

const createUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: DB_NAME
        });

        console.log('✅ Connected to MongoDB');

        // Update existing users or create new ones
        // This ensures passwords are re-hashed with the new JWT_SECRET

        // Admin User
        let admin = await User.findOne({ email: 'admin@aitrainer.com' });
        if (!admin) {
            // Check if username exists
            const existingUsername = await User.findOne({ username: 'admin' });
            if (existingUsername) {
                // Update the existing user
                existingUsername.email = 'admin@aitrainer.com';
                existingUsername.password = 'Admin@123';
                existingUsername.role = 'admin';
                existingUsername.status = 'active';
                await existingUsername.save();
                console.log('✅ Admin user updated from existing username');
            } else {
                admin = await User.create({
                    username: 'admin',
                    email: 'admin@aitrainer.com',
                    password: 'Admin@123',
                    role: 'admin',
                    status: 'active',
                    profile: { firstName: 'Admin', lastName: 'User' }
                });
                console.log('✅ Admin user created');
            }
        } else {
            admin.password = 'Admin@123';
            await admin.save();
            console.log('✅ Admin user password updated');
        }

        // Trainer User
        let trainer = await User.findOne({ email: 'trainer@aitrainer.com' });
        if (!trainer) {
            // Check if username exists
            const existingUsername = await User.findOne({ username: 'trainer1' });
            if (existingUsername) {
                existingUsername.email = 'trainer@aitrainer.com';
                existingUsername.password = 'Trainer@123';
                existingUsername.role = 'trainer';
                existingUsername.status = 'active';
                await existingUsername.save();
                console.log('✅ Trainer user updated from existing username');
            } else {
                trainer = await User.create({
                    username: 'trainer1',
                    email: 'trainer@aitrainer.com',
                    password: 'Trainer@123',
                    role: 'trainer',
                    status: 'active',
                    profile: {
                        firstName: 'John',
                        lastName: 'Trainer',
                        specialization: 'Strength Training',
                        bio: 'Certified personal trainer with 5 years experience',
                        yearsOfExperience: 5
                    }
                });
                console.log('✅ Trainer user created');
            }
        } else {
            trainer.password = 'Trainer@123';
            await trainer.save();
            console.log('✅ Trainer user password updated');
        }

        // Member User
        let member = await User.findOne({ email: 'member@aitrainer.com' });
        if (!member) {
            // Check if username exists
            const existingUsername = await User.findOne({ username: 'member1' });
            if (existingUsername) {
                existingUsername.email = 'member@aitrainer.com';
                existingUsername.password = 'Member@123';
                existingUsername.role = 'member';
                existingUsername.status = 'active';
                await existingUsername.save();
                console.log('✅ Member user updated from existing username');
            } else {
                member = await User.create({
                    username: 'member1',
                    email: 'member@aitrainer.com',
                    password: 'Member@123',
                    role: 'member',
                    status: 'active',
                    profile: {
                        firstName: 'Jane',
                        lastName: 'Member',
                        age: 28,
                        gender: 'female',
                        height: 165,
                        weight: 60,
                        fitnessLevel: 'intermediate',
                        fitnessGoals: ['Weight Loss', 'Build Muscle']
                    }
                });
                console.log('✅ Member user created');
            }
        } else {
            member.password = 'Member@123';
            await member.save();
            console.log('✅ Member user password updated');
        }

        console.log('\n📋 Test User Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Admin:');
        console.log('  Email: admin@aitrainer.com');
        console.log('  Password: Admin@123');
        console.log('\nTrainer:');
        console.log('  Email: trainer@aitrainer.com');
        console.log('  Password: Trainer@123');
        console.log('\nMember:');
        console.log('  Email: member@aitrainer.com');
        console.log('  Password: Member@123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating users:', error);
        process.exit(1);
    }
};

createUsers();
