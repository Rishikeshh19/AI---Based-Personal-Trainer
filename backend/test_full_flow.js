const API_URL = 'http://localhost:5000/api';

async function testFullFlow() {
    console.log('🧪 Testing Full Login to Profile Flow\n');

    try {
        // Step 1: Login
        console.log('1️⃣  Attempting login...');
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'testpass123'
            })
        });

        if (!loginResponse.ok) {
            throw new Error(`Login failed with status ${loginResponse.status}`);
        }

        const loginData = await loginResponse.json();
        console.log('✅ Login successful');
        console.log(`   Token: ${loginData.token.substring(0, 50)}...`);
        console.log(`   User: ${loginData.data.email} (${loginData.data.role})`);
        console.log(`   Profile complete: ${loginData.isProfileComplete}`);

        // Step 2: Get Profile
        console.log('\n2️⃣  Fetching profile with token...');
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
        console.log('✅ Profile fetched successfully');
        console.log(`   Email: ${profileData.data.email}`);
        console.log(`   Username: ${profileData.data.username}`);
        console.log(`   Role: ${profileData.data.role}`);
        console.log(`   Profile completeness:`);
        console.log(`     - First name: ${profileData.data.profile.firstName || 'NOT SET'}`);
        console.log(`     - Last name: ${profileData.data.profile.lastName || 'NOT SET'}`);
        console.log(`     - Age: ${profileData.data.profile.age || 'NOT SET'}`);
        console.log(`     - Gender: ${profileData.data.profile.gender || 'NOT SET'}`);
        console.log(`     - Height: ${profileData.data.profile.height || 'NOT SET'}`);
        console.log(`     - Weight: ${profileData.data.profile.weight || 'NOT SET'}`);
        console.log(`     - Fitness level: ${profileData.data.profile.fitnessLevel || 'NOT SET'}`);
        console.log(`     - Goals: ${profileData.data.profile.goals && profileData.data.profile.goals.length > 0 ? profileData.data.profile.goals.join(', ') : 'NOT SET'}`);

        // Step 3: Update Profile
        console.log('\n3️⃣  Updating profile...');
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
                goals: ['weight loss', 'muscle gain'],
                bio: 'Test bio'
            })
        });

        if (!updateResponse.ok) {
            throw new Error(`Profile update failed with status ${updateResponse.status}`);
        }

        const updatedData = await updateResponse.json();
        console.log('✅ Profile updated successfully');
        console.log(`   First name: ${updatedData.data.profile.firstName}`);
        console.log(`   Last name: ${updatedData.data.profile.lastName}`);
        console.log(`   Goals: ${updatedData.data.profile.goals.join(', ')}`);

        console.log('\n✅ FULL LOGIN TO PROFILE FLOW SUCCESSFUL!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testFullFlow();
