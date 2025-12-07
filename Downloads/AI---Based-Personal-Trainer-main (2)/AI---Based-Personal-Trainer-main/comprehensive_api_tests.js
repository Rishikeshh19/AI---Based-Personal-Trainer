// Comprehensive API Testing Script
// Tests all endpoints and functionality of the AI Personal Trainer app

const http = require('http');

// Helper function to make HTTP requests
async function makeRequest(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 8000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(responseData),
                        headers: res.headers
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: responseData,
                        headers: res.headers
                    });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Test Results Storage
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
};

// Test Helper
async function runTest(name, testFn) {
    testResults.total++;
    try {
        await testFn();
        testResults.passed++;
        testResults.tests.push({
            name: name,
            status: '✅ PASSED',
            error: null
        });
        console.log(`✅ ${name}`);
    } catch (error) {
        testResults.failed++;
        testResults.tests.push({
            name: name,
            status: '❌ FAILED',
            error: error.message
        });
        console.log(`❌ ${name}: ${error.message}`);
    }
}

// Main Testing Suite
async function runAllTests() {
    console.log('\n🧪 COMPREHENSIVE API TESTING SUITE\n');
    console.log('================================================\n');

    let token = null;
    let userId = null;

    // ==================== AUTHENTICATION TESTS ====================
    console.log('🔐 AUTHENTICATION TESTS\n');

    // Test 1: Health Check
    await runTest('Health Check - Backend Running', async () => {
        const response = await makeRequest('GET', '/api/auth/health');
        if (response.status !== 200 && response.status !== 404) {
            // 404 is ok, means endpoint doesn't exist but server is running
            throw new Error(`Status: ${response.status}`);
        }
    });

    // Test 2: Register
    const testUser = {
        username: `testuser${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'TestPassword123456',
        role: 'member'
    };

    await runTest('Register - Create New User', async () => {
        const response = await makeRequest('POST', '/api/auth/register', testUser);
        if (response.status !== 201 && response.status !== 200) {
            throw new Error(`Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
        }
        if (response.data.token) {
            token = response.data.token;
            userId = response.data.user?.id || response.data.user?._id;
        }
    });

    // Test 3: Login
    await runTest('Login - Authenticate User', async () => {
        const response = await makeRequest('POST', '/api/auth/login', {
            email: testUser.email,
            password: testUser.password
        });
        if (response.status !== 200) {
            throw new Error(`Status: ${response.status}`);
        }
        if (response.data.token) {
            token = response.data.token;
            userId = response.data.user?.id || response.data.user?._id;
        }
    });

    // Test 4: Invalid Login
    await runTest('Login - Invalid Credentials Rejected', async () => {
        const response = await makeRequest('POST', '/api/auth/login', {
            email: testUser.email,
            password: 'WrongPassword'
        });
        if (response.status === 200) {
            throw new Error('Invalid credentials were accepted');
        }
    });

    // ==================== USER PROFILE TESTS ====================
    console.log('\n👤 USER PROFILE TESTS\n');

    if (token) {
    // Test 5: Get Profile
        await runTest('Get Profile - Retrieve User Information', async () => {
            const response = await makeRequest('GET', '/api/members/profile', null, token);
            if (response.status !== 200) {
                throw new Error(`Status: ${response.status}`);
            }
        });

        // Test 6: Update Profile
        await runTest('Update Profile - Modify User Data', async () => {
            const response = await makeRequest('PUT', '/api/members/profile', {
                firstName: 'Test',
                lastName: 'User',
                age: 30,
                gender: 'male',
                height: 175,
                weight: 75,
                fitnessLevel: 'intermediate',
                goals: ['muscle-gain']
            }, token);
            if (response.status !== 200) {
                throw new Error(`Status: ${response.status}`);
            }
        });

        // Test 7: Get Updated Profile
        await runTest('Get Profile - Verify Updates', async () => {
            const response = await makeRequest('GET', '/api/members/profile', null, token);
            if (response.status !== 200) {
                throw new Error(`Status: ${response.status}`);
            }
            if (!response.data.data?.profile?.weight) {
                throw new Error('Profile not updated');
            }
        });
    }

    // ==================== WORKOUT TESTS ====================
    console.log('\n💪 WORKOUT TESTS\n');

    if (token) {
        let workoutId = null;

        // Test 8: Create Workout
        await runTest('Create Workout - Add New Workout', async () => {
            const response = await makeRequest('POST', '/api/workouts', {
                name: 'Chest and Triceps',
                date: new Date().toISOString(),
                duration: 60,
                intensity: 'high',
                muscleGroups: ['chest', 'triceps'],
                exercises: [
                    { name: 'Bench Press', sets: 4, reps: 8 },
                    { name: 'Tricep Dips', sets: 3, reps: 10 }
                ],
                caloriesBurned: 350
            }, token);
            if (response.status !== 201 && response.status !== 200) {
                throw new Error(`Status: ${response.status}`);
            }
            workoutId = response.data.workout?.id || response.data._id;
        });

        // Test 9: Get All Workouts
        await runTest('Get Workouts - Retrieve User Workouts', async () => {
            const response = await makeRequest('GET', '/api/workouts', null, token);
            if (response.status !== 200) {
                throw new Error(`Status: ${response.status}`);
            }
        });

        // Test 10: Get Single Workout
        if (workoutId) {
            await runTest('Get Workout - Retrieve Specific Workout', async () => {
                const response = await makeRequest('GET', `/api/workouts/${workoutId}`, null, token);
                if (response.status !== 200) {
                    throw new Error(`Status: ${response.status}`);
                }
            });

            // Test 11: Update Workout
            await runTest('Update Workout - Modify Workout Data', async () => {
                const response = await makeRequest('PUT', `/api/workouts/${workoutId}`, {
                    intensity: 'very-high',
                    caloriesBurned: 400
                }, token);
                if (response.status !== 200) {
                    throw new Error(`Status: ${response.status}`);
                }
            });
        }
    }

    // ==================== AI SUGGESTIONS TESTS ====================
    console.log('\n🧠 AI SUGGESTIONS TESTS\n');

    if (token) {
        // Test 12: Personalized Suggestions - Beginner
        await runTest('AI Suggestions - Beginner Level', async () => {
            const response = await makeRequest('POST', '/api/ai-suggestions/personalized', {
                currentWeight: 70,
                height: 170,
                age: 25,
                fitnessLevel: 'beginner',
                fitnessGoal: 'weight-loss'
            }, token);
            if (response.status !== 200) {
                throw new Error(`Status: ${response.status}`);
            }
            if (!response.data.data?.suggestions) {
                throw new Error('No suggestions in response');
            }
        });

        // Test 13: Personalized Suggestions - Intermediate
        await runTest('AI Suggestions - Intermediate Level', async () => {
            const response = await makeRequest('POST', '/api/ai-suggestions/personalized', {
                currentWeight: 75,
                height: 175,
                age: 30,
                fitnessLevel: 'intermediate',
                fitnessGoal: 'muscle-gain'
            }, token);
            if (response.status !== 200) {
                throw new Error(`Status: ${response.status}`);
            }
        });

        // Test 14: Personalized Suggestions - Advanced
        await runTest('AI Suggestions - Advanced Level', async () => {
            const response = await makeRequest('POST', '/api/ai-suggestions/personalized', {
                currentWeight: 80,
                height: 180,
                age: 35,
                fitnessLevel: 'advanced',
                fitnessGoal: 'strength'
            }, token);
            if (response.status !== 200) {
                throw new Error(`Status: ${response.status}`);
            }
        });
    }

    // ==================== DIET PLAN TESTS ====================
    console.log('\n🍽️  DIET PLAN TESTS\n');

    if (token) {
        // Test 15: Generate Diet Plan
        await runTest('Diet Plan - Generate Custom Plan', async () => {
            const response = await makeRequest('POST', '/api/diet-plan/generate', {
                currentWeight: 75,
                targetWeight: 70,
                height: 175,
                age: 30,
                fitnessLevel: 'intermediate',
                goal: 'weight-loss',
                dietaryRestrictions: 'none'
            }, token);
            if (response.status !== 200 && response.status !== 201) {
                throw new Error(`Status: ${response.status}`);
            }
        });
    }

    // ==================== PROGRESS TESTS ====================
    console.log('\n📊 PROGRESS & ANALYTICS TESTS\n');

    if (token) {
        // Test 16: Get Progress
        await runTest('Progress - Get User Progress Data', async () => {
            const response = await makeRequest('GET', '/api/progress', null, token);
            if (response.status !== 200) {
                throw new Error(`Status: ${response.status}`);
            }
        });

        // Test 17: Get Weekly Progress
        await runTest('Progress - Get Weekly Progress Filter', async () => {
            const response = await makeRequest('GET', '/api/progress?filter=weekly', null, token);
            if (response.status !== 200) {
                throw new Error(`Status: ${response.status}`);
            }
        });

        // Test 18: Get Monthly Progress
        await runTest('Progress - Get Monthly Progress Filter', async () => {
            const response = await makeRequest('GET', '/api/progress?filter=monthly', null, token);
            if (response.status !== 200) {
                throw new Error(`Status: ${response.status}`);
            }
        });
    }

    // ==================== TRAINER/MEMBER TESTS ====================
    console.log('\n👨‍🏫 TRAINER & MEMBER TESTS\n');

    if (token) {
        // Test 19: Get Trainers (if member)
        await runTest('Trainers - Get Available Trainers', async () => {
            const response = await makeRequest('GET', '/api/trainers', null, token);
            if (response.status !== 200 && response.status !== 404) {
                throw new Error(`Status: ${response.status}`);
            }
        });

        // Test 20: Get User Role
        await runTest('User - Get User Role', async () => {
            const response = await makeRequest('GET', '/api/members/profile', null, token);
            if (response.status !== 200) {
                throw new Error(`Status: ${response.status}`);
            }
        });
    }

    // ==================== SUMMARY ====================
    console.log('\n================================================\n');
    console.log('📋 TEST RESULTS SUMMARY\n');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%\n`);

    if (testResults.failed > 0) {
        console.log('Failed Tests:');
        testResults.tests
            .filter(t => t.status.includes('FAILED'))
            .forEach(t => {
                console.log(`  - ${t.name}: ${t.error}`);
            });
    }

    console.log('\n================================================\n');

    return testResults;
}

// Run all tests
runAllTests().then((results) => {
    process.exit(results.failed > 0 ? 1 : 0);
}).catch((error) => {
    console.error('Test suite error:', error);
    process.exit(1);
});
