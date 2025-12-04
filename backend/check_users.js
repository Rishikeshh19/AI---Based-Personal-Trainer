// Quick check script for debugging authentication issues
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connection string
const MONGODB_URI = 'mongodb+srv://trainer:trainer%40123@cluster0.l1vr8dg.mongodb.net/ai_trainer?retryWrites=true&w=majority';

// User Schema (minimal)
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: String
});

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function checkUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get all users
        const users = await User.find({}).select('-password');
        console.log(`\n📊 Total users in database: ${users.length}`);
        
        if (users.length > 0) {
            console.log('\n📋 Users:');
            users.forEach((user, index) => {
                console.log(`  ${index + 1}. Email: ${user.email}, Username: ${user.username}, Role: ${user.role}`);
            });
        } else {
            console.log('\n⚠️  No users found in database');
            console.log('You need to sign up first!');
        }

        // Test a known user if any exist
        if (users.length > 0) {
            console.log('\n🔐 Testing password comparison...');
            const testUser = users[0];
            
            // Note: We'd need to know the plain password to test
            console.log(`First user: ${testUser.email}`);
            console.log('(Cannot test password without knowing the original value)');
        }

        await mongoose.connection.close();
        console.log('\n✅ Connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkUsers();
