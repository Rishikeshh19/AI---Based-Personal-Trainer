# AI Features Setup Guide

## Overview

The AI Personal Trainer uses Google's Gemini API to provide personalized workout suggestions and diet plans. This guide will help you set up the AI features.

## Step 1: Get Your Gemini API Key (FREE)

1. **Visit Google AI Studio**

   - Go to: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Sign In**

   - Use your Google account to sign in

3. **Create API Key**

   - Click the "Create API Key" button
   - Select "Create API key in new project" (recommended for first-time users)
   - Copy the generated API key immediately (you won't be able to see it again)

4. **Important Notes**
   - The Gemini API has a generous FREE tier with 60 requests per minute
   - No credit card required for the free tier
   - Perfect for development and personal use

## Step 2: Configure Your Backend

### Option A: Using the Setup Script (Recommended)

```bash
cd backend
node setup.js
```

Follow the prompts to enter your Gemini API key.

### Option B: Manual Configuration

1. Open `backend/.env` file
2. Find the line: `GEMINI_API_KEY=your_gemini_api_key_here`
3. Replace `your_gemini_api_key_here` with your actual API key
4. Save the file

Example:

```env
GEMINI_API_KEY=AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 3: Restart the Backend

```bash
cd backend
npm start
```

You should see a log message confirming the Gemini API is initialized.

## Step 4: Test the AI Features

1. **Login to the Application**

   - Go to http://localhost:5173
   - Login with your credentials

2. **Test AI Workout Suggestions**

   - Navigate to "AI Suggestions" page
   - Fill in your profile details (age, weight, height, fitness goals)
   - Click "Get AI Suggestions"
   - You should receive personalized workout recommendations

3. **Test AI Diet Plan**
   - Navigate to "AI Diet Plan" page
   - Fill in your details and dietary preferences
   - Select cuisine preference (South Indian, North Indian, or Mixed)
   - Click "Generate Diet Plan"
   - You should receive 3 different diet plan variations

## Troubleshooting

### Issue: "AI service temporarily unavailable"

**Cause**: Gemini API key is not configured or invalid

**Solution**:

1. Verify your API key is correctly set in `.env`
2. Check that there are no extra spaces or quotes around the key
3. Ensure the API key is active in Google AI Studio
4. Restart the backend server

### Issue: "Failed to generate content: 429 Too Many Requests"

**Cause**: Rate limit exceeded (60 requests per minute on free tier)

**Solution**:

- Wait a minute before trying again
- For production use, consider upgrading to a paid tier

### Issue: AI features not working but no error message

**Cause**: Application is using fallback rule-based suggestions

**Solution**:

1. Check backend console logs for error messages
2. Verify your internet connection
3. Test the API key directly in Google AI Studio
4. Check `.env` file for proper configuration

## Features Powered by Gemini AI

### 1. Workout Suggestions

- Personalized exercise recommendations
- Complete weekly training schedules
- Progressive overload strategies
- Form tips and safety guidelines
- Nutrition timing recommendations

### 2. Diet Plans

- 7-day customized meal plans
- Cuisine-specific options (South Indian, North Indian, Mixed)
- Detailed macronutrient breakdown
- Portion sizes and calorie counts
- Grocery shopping lists
- Meal prep tips

### 3. Nutrition Advice

- Personalized calorie targets
- Macro distribution recommendations
- Supplement suggestions
- Hydration guidelines

## Fallback Mode

If the Gemini API is not configured or unavailable, the application will automatically use **rule-based suggestions**. These are less personalized but still provide useful guidance based on:

- Fitness level (beginner, intermediate, advanced)
- Primary goals (weight loss, muscle gain, strength, maintenance)
- Basic profile information

While functional, we highly recommend setting up the Gemini API for the best user experience.

## API Usage and Costs

### Free Tier (Sufficient for Personal Use)

- 60 requests per minute
- 1,500 requests per day
- No credit card required

### What This Means for Users

- Each workout suggestion = 1 request
- Each diet plan generation = 3 requests (for 3 variations)
- With the free tier, you can generate ~500 diet plans or ~1,500 workout suggestions per day

### Monitoring Usage

- Check your usage at: https://aistudio.google.com/app/apikey
- Set up usage alerts in Google Cloud Console (optional)

## Security Best Practices

1. **Never commit your `.env` file to git**
   - Already in `.gitignore` by default
2. **Keep your API key private**
   - Don't share it in screenshots or documentation
3. **Regenerate if compromised**

   - If your key is exposed, regenerate it immediately in Google AI Studio

4. **Use environment variables in production**
   - Never hardcode API keys in source code

## Support

If you encounter issues not covered in this guide:

1. Check the backend console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test your API key independently at Google AI Studio
4. Refer to the official Gemini API documentation: https://ai.google.dev/docs

## Next Steps

Once AI features are working:

- Complete your user profile for better personalization
- Try different fitness goals to see varied suggestions
- Explore all three cuisine options in diet plans
- Provide feedback to help improve the AI prompts

---

**Happy Training! 💪**
