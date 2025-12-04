const mongoose = require('mongoose');
require('dotenv').config();

const createTestUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const User = require('./models/User');

        // Delete old test users
        const testEmails = ['test@example.com', 'john@example.com', 'newuser_1764753552387@example.com'];
        
        console.log('\n🧹 Cleaning up old test users...');
        for (const email of testEmails) {
            const result = await User.deleteOne({ email });
            if (result.deletedCount > 0) {
                console.log(`  ✓ Deleted: ${email}`);
            }
        }

        // Create new test user with known credentials
        console.log('\n✨ Creating new test user...');
        const newUser = await User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: 'testpass123',
            role: 'user'
        });

        console.log('\n✅ Test user created successfully!');
        console.log('\n📋 Credentials for testing:');
        console.log('  Email: test@example.com');
        console.log('  Password: testpass123');
        console.log('  Username: testuser');
        console.log('  Role: user');

        // Test login with new user
        console.log('\n🧪 Testing login with new credentials...');
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'testpass123'
            })
        });

        console.log('Response Status:', response.status, response.statusText);
        const data = await response.json();
        
        if (response.ok && data.token) {
            console.log('✅ Login successful!');
            console.log('Token:', data.token.substring(0, 50) + '...');
            console.log('User:', data.data.email, '-', data.data.role);
        } else {
            console.log('❌ Login failed:', data.error || data.message);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createTestUser();
