// Simulate the frontend login flow to identify issues
console.log('🧪 Testing Frontend Login Flow\n');

// Simulating storage.js setSession function
const mockStorage = {
    setSession(user, token) {
        console.log('✓ setSession called with:');
        console.log('  - User:', {
            id: user._id || user.id,
            email: user.email,
            username: user.username,
            role: user.role
        });
        console.log('  - Token:', token ? token.substring(0, 50) + '...' : 'MISSING');
        
        if (!user) {
            throw new Error('❌ user is null/undefined');
        }
        if (!token) {
            throw new Error('❌ token is null/undefined');
        }
        return true;
    }
};

// Simulate the login handler from login.html
async function simulateLogin() {
    const email = 'test@example.com';
    const password = 'testpass123';
    
    console.log(`📧 Attempting login with: ${email}\n`);
    
    try {
        console.log('1. Fetching from http://localhost:5000/api/auth/login');
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        console.log(`2. Response status: ${response.status} ${response.statusText}`);
        console.log(`3. Response OK: ${response.ok}`);
        
        const data = await response.json();
        console.log(`4. Response parsed successfully\n`);
        
        console.log('Response structure:');
        console.log(JSON.stringify(data, null, 2));
        console.log('\n');
        
        // Check for errors
        if (!response.ok) {
            console.log('❌ Response not OK - throwing error');
            throw new Error(data.error || 'Login failed');
        }
        
        console.log('5. Checking for required fields:');
        console.log(`   - data.token: ${data.token ? '✓ EXISTS' : '❌ MISSING'}`);
        console.log(`   - data.data: ${data.data ? '✓ EXISTS' : '❌ MISSING'}`);
        if (data.data) {
            console.log(`   - data.data._id: ${data.data._id ? '✓ EXISTS' : '❌ MISSING'}`);
            console.log(`   - data.data.email: ${data.data.email ? '✓ EXISTS: ' + data.data.email : '❌ MISSING'}`);
            console.log(`   - data.data.role: ${data.data.role ? '✓ EXISTS: ' + data.data.role : '❌ MISSING'}`);
        }
        console.log(`   - data.isProfileComplete: ${data.isProfileComplete !== undefined ? '✓ EXISTS: ' + data.isProfileComplete : '❌ MISSING'}`);
        console.log('\n');
        
        // Simulate setSession call
        console.log('6. Calling storage.setSession()');
        mockStorage.setSession(data.data, data.token);
        console.log('✓ setSession succeeded\n');
        
        // Check redirect logic
        console.log('7. Determining redirect URL:');
        if (data.isProfileComplete === false) {
            console.log('   → Profile incomplete, redirecting to profile.html?setup=true');
        } else if (data.data.role === 'trainer') {
            console.log('   → Trainer role, redirecting to trainer-dashboard.html');
        } else {
            console.log('   → User role, redirecting to dashboard.html');
        }
        
        console.log('\n✅ LOGIN FLOW SUCCESSFUL!\n');
        
    } catch (error) {
        console.log(`\n❌ LOGIN FLOW FAILED!`);
        console.log(`Error: ${error.message}\n`);
        console.log('Stack trace:');
        console.log(error.stack);
    }
}

// Run the simulation
simulateLogin();
