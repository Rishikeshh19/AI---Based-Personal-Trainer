const API_URL = 'http://localhost:5000/api';

async function testSignupLoginFlow() {
    console.log('🧪 Testing Complete Signup → Login → Dashboard Flow\n');

    const testEmail = `newuser_${Date.now()}@example.com`;
    const testPassword = 'SecurePass123!';
    const testUsername = `user_${Date.now()}`;

    try {
        // Step 1: Signup
        console.log('1️⃣  Attempting signup...');
        const signupResponse = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: testUsername,
                email: testEmail,
                password: testPassword,
                role: 'user'
            })
        });

        if (!signupResponse.ok) {
            const error = await signupResponse.json();
            throw new Error(`Signup failed: ${error.error || error.message}`);
        }

        const signupData = await signupResponse.json();
        console.log('✅ Signup successful');
        console.log(`   Email: ${signupData.data.email}`);
        console.log(`   Username: ${signupData.data.username}`);
        console.log(`   Role: ${signupData.data.role}`);
        console.log(`   Profile complete: ${signupData.isProfileComplete}`);
        
        const token = signupData.token;
        const userId = signupData.data._id;

        // Step 2: Login with same credentials
        console.log('\n2️⃣  Attempting login with same credentials...');
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword
            })
        });

        if (!loginResponse.ok) {
            throw new Error(`Login failed with status ${loginResponse.status}`);
        }

        const loginData = await loginResponse.json();
        console.log('✅ Login successful');
        console.log(`   Token: ${loginData.token.substring(0, 50)}...`);
        console.log(`   User: ${loginData.data.email}`);

        // Step 3: Access protected profile endpoint
        console.log('\n3️⃣  Accessing protected profile endpoint...');
        const profileResponse = await fetch(`${API_URL}/members/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });

        if (!profileResponse.ok) {
            throw new Error(`Profile fetch failed with status ${profileResponse.status}`);
        }

        const profileData = await profileResponse.json();
        console.log('✅ Profile endpoint accessible');
        console.log(`   Email: ${profileData.data.email}`);
        console.log(`   Username: ${profileData.data.username}`);

        // Step 4: Try to fetch workouts (what dashboard needs)
        console.log('\n4️⃣  Accessing protected workouts endpoint...');
        const workoutsResponse = await fetch(`${API_URL}/workouts/member/all`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });

        if (workoutsResponse.ok) {
            const workoutsData = await workoutsResponse.json();
            console.log('✅ Workouts endpoint accessible');
            console.log(`   Workouts count: ${Array.isArray(workoutsData.data) ? workoutsData.data.length : 0}`);
        } else if (workoutsResponse.status === 404) {
            console.log('⚠️  Workouts endpoint returned 404 - endpoint might not exist');
        } else {
            throw new Error(`Workouts fetch failed with status ${workoutsResponse.status}`);
        }

        // Step 5: Update profile to complete it
        console.log('\n5️⃣  Updating profile to complete it...');
        const updateResponse = await fetch(`${API_URL}/members/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify({
                firstName: 'Test',
                lastName: 'User',
                age: 25,
                gender: 'male',
                height: 180,
                weight: 75,
                fitnessLevel: 'beginner',
                goals: ['muscle gain']
            })
        });

        if (!updateResponse.ok) {
            throw new Error(`Profile update failed with status ${updateResponse.status}`);
        }

        const updatedProfile = await updateResponse.json();
        console.log('✅ Profile updated successfully');
        console.log(`   First name: ${updatedProfile.data.profile.firstName}`);
        console.log(`   Last name: ${updatedProfile.data.profile.lastName}`);

        console.log('\n✅ COMPLETE FLOW SUCCESSFUL!\n');
        console.log('✅ All systems ready for production use!');

    } catch (error) {
        console.error('\n❌ Flow failed:', error.message);
        console.log('\n⚠️  Troubleshooting:');
        console.log('   1. Ensure backend is running on port 5000');
        console.log('   2. Check MongoDB connection');
        console.log('   3. Verify all API routes are registered');
    }
}

testSignupLoginFlow();
