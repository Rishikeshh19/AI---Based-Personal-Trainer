require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const runVerification = async () => {
    console.log('Starting Backend Verification...');

    // 1. Test Database Connection
    console.log('\n1. Testing Database Connection...');
    const MONGODB_URI = process.env.MONGODB_URL || 'mongodb://localhost:27017/ai_trainer';
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ Connected to MongoDB successfully.');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }

    // 2. Test User Creation (Storage)
    console.log('\n2. Testing User Storage (Create Test User)...');
    const testUserEmail = 'test_verification_user@example.com';
    const testUserPassword = 'password123';

    try {
        // Cleanup if exists
        await User.deleteOne({ email: testUserEmail });

        const user = await User.create({
            username: 'test_verification_user',
            email: testUserEmail,
            password: testUserPassword,
            role: 'user'
        });
        console.log(`✅ Test user created with ID: ${user._id}`);

        // 3. Test JWT Generation
        console.log('\n3. Testing JWT Generation...');
        const token = user.getSignedJwtToken();
        if (token) {
            console.log('✅ JWT Token generated successfully.');
        } else {
            console.error('❌ Failed to generate JWT Token.');
            process.exit(1);
        }

        // 4. Test JWT Verification
        console.log('\n4. Testing JWT Verification...');
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.id === user._id.toString()) {
                console.log('✅ JWT Token verified successfully. User ID matches.');
            } else {
                console.error('❌ JWT Verification failed: ID mismatch.');
            }
        } catch (err) {
            console.error('❌ JWT Verification failed:', err.message);
        }

        // 5. Cleanup
        console.log('\n5. Cleaning up...');
        await User.deleteOne({ _id: user._id });
        console.log('✅ Test user deleted.');

    } catch (error) {
        console.error('❌ Error during verification:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nVerification Complete.');
    }
};

runVerification();
