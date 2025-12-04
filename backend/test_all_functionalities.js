/**
 * Comprehensive Test Suite for Member and Trainer Functionalities
 * Tests all major workflows and features
 */

const http = require('http');
const https = require('https');
const API_URL = 'http://localhost:5000/api';

let testResults = {
    passed: [],
    failed: [],
    warnings: []
};

// Helper function to make API requests
async function makeRequest(method, endpoint, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint, API_URL);
        const options = {
            hostname: url.hostname,
            port: url.port || 80,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    body: data ? JSON.parse(data) : null
                });
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// Test Functions
async function testAuthentication() {
    console.log('\n=== TESTING AUTHENTICATION ===\n');

    // Test 1: Register as Member
    try {
        const res = await makeRequest('POST', '/auth/register', {
            username: `testmember_${Date.now()}`,
            email: `testmember_${Date.now()}@test.com`,
            password: 'Test@12345',
            role: 'member'
        });

        if (res.status === 200 && res.body.token) {
            testResults.passed.push('✅ Member Registration');
            console.log('✅ Member Registration - PASSED');
        } else {
            testResults.failed.push('❌ Member Registration - ' + (res.body.message || 'Unknown error'));
            console.log('❌ Member Registration - FAILED');
        }
    } catch (error) {
        testResults.failed.push('❌ Member Registration - ' + error.message);
        console.log('❌ Member Registration - ERROR:', error.message);
    }

    // Test 2: Register as Trainer
    try {
        const res = await makeRequest('POST', '/auth/register', {
            username: `testtrainer_${Date.now()}`,
            email: `testtrainer_${Date.now()}@test.com`,
            password: 'Test@12345',
            role: 'trainer'
        });

        if (res.status === 200 && res.body.token) {
            testResults.passed.push('✅ Trainer Registration');
            console.log('✅ Trainer Registration - PASSED');
            global.trainerToken = res.body.token;
            global.trainerId = res.body.data._id;
        } else {
            testResults.failed.push('❌ Trainer Registration - ' + (res.body.message || 'Unknown error'));
            console.log('❌ Trainer Registration - FAILED');
        }
    } catch (error) {
        testResults.failed.push('❌ Trainer Registration - ' + error.message);
        console.log('❌ Trainer Registration - ERROR:', error.message);
    }

    // Test 3: Login
    try {
        const res = await makeRequest('POST', '/auth/login', {
            email: `testmember_${Date.now()}@test.com`,
            password: 'Test@12345'
        });

        if (res.status === 200 && res.body.token) {
            testResults.passed.push('✅ User Login');
            console.log('✅ User Login - PASSED');
            global.memberToken = res.body.token;
            global.memberId = res.body.data._id;
        } else {
            testResults.failed.push('❌ User Login - ' + (res.body.message || 'Unknown error'));
            console.log('❌ User Login - FAILED');
        }
    } catch (error) {
        testResults.failed.push('❌ User Login - ' + error.message);
        console.log('❌ User Login - ERROR:', error.message);
    }
}

async function testMemberFeatures() {
    console.log('\n=== TESTING MEMBER FEATURES ===\n');

    if (!global.memberToken) {
        console.log('⚠️  Skipping member tests - no valid token');
        return;
    }

    // Test 1: Get Member Profile
    try {
        const res = await makeRequest('GET', '/members/profile', null, global.memberToken);
        if (res.status === 200) {
            testResults.passed.push('✅ Get Member Profile');
            console.log('✅ Get Member Profile - PASSED');
        } else {
            testResults.failed.push('❌ Get Member Profile');
            console.log('❌ Get Member Profile - FAILED', res.body);
        }
    } catch (error) {
        testResults.failed.push('❌ Get Member Profile - ' + error.message);
        console.log('❌ Get Member Profile - ERROR:', error.message);
    }

    // Test 2: Update Member Profile
    try {
        const res = await makeRequest('PUT', '/members/profile', {
            firstName: 'Test',
            lastName: 'Member',
            age: 25,
            gender: 'male',
            fitnessLevel: 'beginner',
            goals: ['muscle gain', 'strength']
        }, global.memberToken);

        if (res.status === 200) {
            testResults.passed.push('✅ Update Member Profile');
            console.log('✅ Update Member Profile - PASSED');
        } else {
            testResults.failed.push('❌ Update Member Profile');
            console.log('❌ Update Member Profile - FAILED');
        }
    } catch (error) {
        testResults.failed.push('❌ Update Member Profile - ' + error.message);
        console.log('❌ Update Member Profile - ERROR:', error.message);
    }

    // Test 3: Assign Trainer to Member
    if (global.trainerId) {
        try {
            const res = await makeRequest('PUT', '/members/assign-trainer', {
                trainerId: global.trainerId
            }, global.memberToken);

            if (res.status === 200) {
                testResults.passed.push('✅ Assign Trainer to Member');
                console.log('✅ Assign Trainer to Member - PASSED');
            } else {
                testResults.failed.push('❌ Assign Trainer to Member');
                console.log('❌ Assign Trainer to Member - FAILED', res.body);
            }
        } catch (error) {
            testResults.failed.push('❌ Assign Trainer to Member - ' + error.message);
            console.log('❌ Assign Trainer to Member - ERROR:', error.message);
        }
    }

    // Test 4: Get Member Progress
    try {
        const res = await makeRequest('GET', '/members/progress', null, global.memberToken);
        if (res.status === 200) {
            testResults.passed.push('✅ Get Member Progress');
            console.log('✅ Get Member Progress - PASSED');
        } else {
            testResults.failed.push('❌ Get Member Progress');
            console.log('❌ Get Member Progress - FAILED');
        }
    } catch (error) {
        testResults.failed.push('❌ Get Member Progress - ' + error.message);
        console.log('❌ Get Member Progress - ERROR:', error.message);
    }
}

async function testTrainerFeatures() {
    console.log('\n=== TESTING TRAINER FEATURES ===\n');

    if (!global.trainerToken) {
        console.log('⚠️  Skipping trainer tests - no valid token');
        return;
    }

    // Test 1: Get All Trainers
    try {
        const res = await makeRequest('GET', '/trainers', null, global.trainerToken);
        if (res.status === 200) {
            testResults.passed.push('✅ Get All Trainers');
            console.log('✅ Get All Trainers - PASSED');
        } else {
            testResults.failed.push('❌ Get All Trainers');
            console.log('❌ Get All Trainers - FAILED');
        }
    } catch (error) {
        testResults.failed.push('❌ Get All Trainers - ' + error.message);
        console.log('❌ Get All Trainers - ERROR:', error.message);
    }

    // Test 2: Get Assigned Clients
    try {
        const res = await makeRequest('GET', '/trainers/clients', null, global.trainerToken);
        if (res.status === 200) {
            testResults.passed.push('✅ Get Assigned Clients');
            console.log('✅ Get Assigned Clients - PASSED');
        } else {
            testResults.failed.push('❌ Get Assigned Clients');
            console.log('❌ Get Assigned Clients - FAILED');
        }
    } catch (error) {
        testResults.failed.push('❌ Get Assigned Clients - ' + error.message);
        console.log('❌ Get Assigned Clients - ERROR:', error.message);
    }

    // Test 3: Get Trainer Profile
    try {
        const res = await makeRequest('GET', '/members/profile', null, global.trainerToken);
        if (res.status === 200) {
            testResults.passed.push('✅ Get Trainer Profile');
            console.log('✅ Get Trainer Profile - PASSED');
        } else {
            testResults.failed.push('❌ Get Trainer Profile');
            console.log('❌ Get Trainer Profile - FAILED');
        }
    } catch (error) {
        testResults.failed.push('❌ Get Trainer Profile - ' + error.message);
        console.log('❌ Get Trainer Profile - ERROR:', error.message);
    }
}

async function testWorkoutFeatures() {
    console.log('\n=== TESTING WORKOUT FEATURES ===\n');

    if (!global.memberToken) {
        console.log('⚠️  Skipping workout tests - no valid member token');
        return;
    }

    // Test 1: Create Workout
    try {
        const res = await makeRequest('POST', '/workouts', {
            exercises: ['Push ups', 'Squats'],
            sets: 3,
            reps: 15,
            totalDuration: 30,
            totalCalories: 250,
            date: new Date().toISOString(),
            notes: 'Test workout'
        }, global.memberToken);

        if (res.status === 201 || res.status === 200) {
            testResults.passed.push('✅ Create Workout');
            console.log('✅ Create Workout - PASSED');
            global.workoutId = res.body.data._id;
        } else {
            testResults.failed.push('❌ Create Workout');
            console.log('❌ Create Workout - FAILED', res.body);
        }
    } catch (error) {
        testResults.failed.push('❌ Create Workout - ' + error.message);
        console.log('❌ Create Workout - ERROR:', error.message);
    }

    // Test 2: Get All Workouts
    try {
        const res = await makeRequest('GET', '/workouts', null, global.memberToken);
        if (res.status === 200) {
            testResults.passed.push('✅ Get All Workouts');
            console.log('✅ Get All Workouts - PASSED');
        } else {
            testResults.failed.push('❌ Get All Workouts');
            console.log('❌ Get All Workouts - FAILED');
        }
    } catch (error) {
        testResults.failed.push('❌ Get All Workouts - ' + error.message);
        console.log('❌ Get All Workouts - ERROR:', error.message);
    }

    // Test 3: Get Single Workout
    if (global.workoutId) {
        try {
            const res = await makeRequest('GET', `/workouts/${global.workoutId}`, null, global.memberToken);
            if (res.status === 200) {
                testResults.passed.push('✅ Get Single Workout');
                console.log('✅ Get Single Workout - PASSED');
            } else {
                testResults.failed.push('❌ Get Single Workout');
                console.log('❌ Get Single Workout - FAILED');
            }
        } catch (error) {
            testResults.failed.push('❌ Get Single Workout - ' + error.message);
            console.log('❌ Get Single Workout - ERROR:', error.message);
        }
    }
}

async function testExerciseFeatures() {
    console.log('\n=== TESTING EXERCISE FEATURES ===\n');

    if (!global.memberToken) {
        console.log('⚠️  Skipping exercise tests - no valid token');
        return;
    }

    // Test 1: Get All Exercises
    try {
        const res = await makeRequest('GET', '/exercises', null, global.memberToken);
        if (res.status === 200) {
            testResults.passed.push('✅ Get All Exercises');
            console.log('✅ Get All Exercises - PASSED');
        } else {
            testResults.failed.push('❌ Get All Exercises');
            console.log('❌ Get All Exercises - FAILED');
        }
    } catch (error) {
        testResults.failed.push('❌ Get All Exercises - ' + error.message);
        console.log('❌ Get All Exercises - ERROR:', error.message);
    }
}

async function generateReport() {
    console.log('\n\n╔════════════════════════════════════════════╗');
    console.log('║         COMPREHENSIVE TEST REPORT          ║');
    console.log('╚════════════════════════════════════════════╝\n');

    console.log(`✅ PASSED: ${testResults.passed.length}`);
    testResults.passed.forEach(test => console.log(`   ${test}`));

    console.log(`\n❌ FAILED: ${testResults.failed.length}`);
    testResults.failed.forEach(test => console.log(`   ${test}`));

    console.log(`\n⚠️  WARNINGS: ${testResults.warnings.length}`);
    testResults.warnings.forEach(warning => console.log(`   ${warning}`));

    const totalTests = testResults.passed.length + testResults.failed.length;
    const passPercentage = totalTests > 0 ? (testResults.passed.length / totalTests * 100).toFixed(2) : 0;

    console.log(`\n📊 SUCCESS RATE: ${passPercentage}% (${testResults.passed.length}/${totalTests})\n`);

    if (testResults.failed.length === 0) {
        console.log('🎉 ALL TESTS PASSED! The app is working correctly.\n');
    } else {
        console.log('⚠️  Some tests failed. Please review the errors above.\n');
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Comprehensive Functionality Tests...\n');

    await testAuthentication();
    await testMemberFeatures();
    await testTrainerFeatures();
    await testWorkoutFeatures();
    await testExerciseFeatures();
    await generateReport();

    process.exit(0);
}

// Execute
runAllTests().catch(error => {
    console.error('FATAL ERROR:', error);
    process.exit(1);
});
