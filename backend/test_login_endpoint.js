const http = require('http');

console.log('Testing login endpoint...\n');

const postData = JSON.stringify({
    email: 'test@example.com',
    password: 'testpass123'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
    }
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('\nResponse Body:');
        try {
            const parsed = JSON.parse(data);
            console.log(JSON.stringify(parsed, null, 2));
            
            if (res.statusCode === 200 && parsed.token) {
                console.log('\n✅ LOGIN SUCCESSFUL!');
                console.log('Token:', parsed.token.substring(0, 50) + '...');
                console.log('User:', parsed.data.email);
            } else {
                console.log('\n❌ Login failed:', parsed.error || 'Unknown error');
            }
        } catch (e) {
            console.log(data);
        }
        process.exit(0);
    });
});

req.on('error', (error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
});

req.write(postData);
req.end();
