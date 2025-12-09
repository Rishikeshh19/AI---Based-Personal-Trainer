const axios = require('axios');
require('dotenv').config();

const SAMBANOVA_API_KEY = process.env.SAMBANOVA_API_KEY;
const SAMBANOVA_API_URL = 'https://api.sambanova.ai/v1/chat/completions';

/**
 * Generate content using SambaNova API
 * @param {string} prompt - The prompt to send to the AI
 * @param {object} config - Optional generation config
 * @returns {Promise<string>} - The generated content
 */
async function generateContent(prompt, config = {}) {
    try {
        if (!SAMBANOVA_API_KEY) {
            throw new Error('SambaNova API key not configured');
        }

        const response = await axios.post(
            SAMBANOVA_API_URL,
            {
                model: config.model || 'Meta-Llama-3.1-8B-Instruct',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert personal trainer and fitness coach. Provide comprehensive, personalized, and actionable fitness advice.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: config.temperature || 0.7,
                max_tokens: config.max_tokens || 2048,
                top_p: config.top_p || 0.9
            },
            {
                headers: {
                    'Authorization': `Bearer ${SAMBANOVA_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        if (response.data && response.data.choices && response.data.choices[0]) {
            return response.data.choices[0].message.content;
        } else {
            throw new Error('Invalid response format from SambaNova API');
        }
    } catch (error) {
        if (error.response) {
            console.error('SambaNova API Error:', error.response.status, error.response.data);
            throw new Error(`SambaNova API error: ${error.response.data.error || error.message}`);
        } else if (error.request) {
            console.error('SambaNova API Request Error:', error.message);
            throw new Error('Failed to connect to SambaNova API');
        } else {
            console.error('SambaNova Error:', error.message);
            throw error;
        }
    }
}

/**
 * Generate workout suggestions using SambaNova
 */
async function generateWorkoutSuggestions(userProfile) {
    const prompt = `Create a personalized workout plan for:
Age: ${userProfile.age}, Weight: ${userProfile.weight}kg, Height: ${userProfile.height}cm
Fitness Level: ${userProfile.fitnessLevel}
Goal: ${userProfile.fitnessGoal}
${userProfile.medicalConditions ? `Medical Conditions: ${userProfile.medicalConditions}` : ''}

Provide a comprehensive workout plan with exercises, sets, reps, and form tips. Format with clear sections using **Section Name:** headers.`;

    return await generateContent(prompt);
}

/**
 * Generate nutrition suggestions using SambaNova
 */
async function generateNutritionSuggestions(userProfile) {
    const prompt = `Create a personalized nutrition plan for:
Age: ${userProfile.age}, Weight: ${userProfile.weight}kg, Height: ${userProfile.height}cm
Fitness Level: ${userProfile.fitnessLevel}
Goal: ${userProfile.fitnessGoal}

Provide daily calorie targets, macro split, meal timing, and sample meals. Format with clear sections using **Section Name:** headers.`;

    return await generateContent(prompt);
}

module.exports = {
    generateContent,
    generateWorkoutSuggestions,
    generateNutritionSuggestions
};
