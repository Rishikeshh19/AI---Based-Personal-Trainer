const mongoose = require('mongoose');
require('dotenv').config();

const testLoginResponse = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Make a fetch request to the login endpoint
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'testuser'
            })
        });

        console.log('\n=== LOGIN RESPONSE ===');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Response OK:', response.ok);
        
        const data = await response.json();
        console.log('\nResponse Body:');
        console.log(JSON.stringify(data, null, 2));

        console.log('\n=== KEY FIELDS ===');
        console.log('data.success:', data.success);
        console.log('data.token:', data.token ? 'EXISTS' : 'MISSING');
        console.log('data.isProfileComplete:', data.isProfileComplete);
        console.log('data.data:', data.data ? 'EXISTS' : 'MISSING');
        if (data.data) {
            console.log('  - data.data._id:', data.data._id ? 'EXISTS' : 'MISSING');
            console.log('  - data.data.email:', data.data.email);
            console.log('  - data.data.role:', data.data.role);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

testLoginResponse();
