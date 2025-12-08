#!/usr/bin/env node

/**
 * Setup script for AI Personal Trainer Backend
 * Helps configure the Gemini API key and other environment variables
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
    console.log('\n🚀 AI Personal Trainer - Backend Setup\n');
    console.log('This script will help you configure your environment variables.\n');

    const envPath = path.join(__dirname, '.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
        console.log('✅ Found existing .env file\n');
        envContent = fs.readFileSync(envPath, 'utf8');
    } else {
        console.log('Creating new .env file...\n');
    }

    // Check if Gemini API key needs to be set
    if (!envContent.includes('GEMINI_API_KEY=') || envContent.includes('your_gemini_api_key_here')) {
        console.log('\n📝 Gemini API Key Configuration');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\nThe Gemini API is used for AI-powered features:');
        console.log('  - Personalized workout suggestions');
        console.log('  - Custom diet plan generation');
        console.log('  - Nutrition advice\n');
        console.log('To get your FREE Gemini API key:');
        console.log('  1. Visit: https://makersuite.google.com/app/apikey');
        console.log('  2. Sign in with your Google account');
        console.log('  3. Click "Create API Key"');
        console.log('  4. Copy the generated key\n');

        const geminiKey = await question('Enter your Gemini API key (or press Enter to skip): ');

        if (geminiKey && geminiKey.trim()) {
            if (envContent.includes('GEMINI_API_KEY=')) {
                envContent = envContent.replace(
                    /GEMINI_API_KEY=.*/,
                    `GEMINI_API_KEY=${geminiKey.trim()}`
                );
            } else {
                envContent += `\nGEMINI_API_KEY=${geminiKey.trim()}`;
            }
            console.log('✅ Gemini API key configured!\n');
        } else {
            console.log('⚠️  Skipped Gemini API key setup.');
            console.log('   Note: AI features will use fallback rule-based suggestions.\n');
        }
    } else {
        console.log('✅ Gemini API key is already configured\n');
    }

    // Check SMTP configuration
    if (envContent.includes('your_email@gmail.com') || envContent.includes('your_app_password_here')) {
        console.log('\n📧 Email Configuration (Optional)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email is used for:');
        console.log('  - Password reset emails');
        console.log('  - User notifications\n');

        const configureEmail = await question('Do you want to configure email settings? (y/n): ');

        if (configureEmail.toLowerCase() === 'y') {
            const smtpUser = await question('Enter your Gmail address: ');
            const smtpPassword = await question('Enter your Gmail App Password: ');

            if (smtpUser && smtpPassword) {
                envContent = envContent.replace(/SMTP_USER=.*/, `SMTP_USER=${smtpUser}`);
                envContent = envContent.replace(/SMTP_PASSWORD=.*/, `SMTP_PASSWORD=${smtpPassword}`);
                console.log('✅ Email configured!\n');
            }
        } else {
            console.log('⚠️  Skipped email configuration. Email features will be disabled.\n');
        }
    }

    // Save the updated .env file
    fs.writeFileSync(envPath, envContent);

    console.log('\n✨ Configuration Complete!\n');
    console.log('Next steps:');
    console.log('  1. Review your .env file: backend/.env');
    console.log('  2. Start the backend server: npm start');
    console.log('  3. Test the AI features in the application\n');

    rl.close();
}

setup().catch(err => {
    console.error('Error during setup:', err);
    rl.close();
    process.exit(1);
});
