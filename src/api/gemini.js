// src/api/gemini.js

import { GoogleGenerativeAI } from "@google/generative-ai";

// 🔑 Add your Gemini API key here
const API_KEY = "YOUR_GEMINI_API_KEY_HERE"; // Replace with your actual API key

const genAI = new GoogleGenerativeAI(API_KEY);

export async function analyzeIssueDescription(description, imageUrl = null) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
    Analyze this maintenance issue description and categorize it into one of these categories:
    - Plumbing
    - Electrical  
    - HVAC (Heating, Ventilation, and Air Conditioning)
    - Civil Structures
    - Common Area Maintenance/Housekeeping

    Description: "${description}"

    Return only the category name, nothing else.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const category = response.text().trim();

        console.log("Gemini AI categorization:", category);
        return category;
    } catch (error) {
        console.error("Gemini AI error:", error);
        // Fallback to simple keyword matching
        return fallbackCategorization(description);
    }
}

function fallbackCategorization(description) {
    const text = description.toLowerCase();

    if (text.includes('water') || text.includes('pipe') || text.includes('leak') || text.includes('drain') || text.includes('toilet') || text.includes('sink')) {
        return 'Plumbing';
    }
    if (text.includes('light') || text.includes('electric') || text.includes('power') || text.includes('wire') || text.includes('outlet') || text.includes('switch')) {
        return 'Electrical';
    }
    if (text.includes('heat') || text.includes('air') || text.includes('hvac') || text.includes('ac') || text.includes('ventilation') || text.includes('temperature')) {
        return 'Heating, Ventilation, and Air Conditioning';
    }
    if (text.includes('wall') || text.includes('floor') || text.includes('ceiling') || text.includes('structure') || text.includes('crack') || text.includes('building')) {
        return 'Civil Structures';
    }

    return 'Common Area Maintenance/Housekeeping'; // Default fallback
}

export default analyzeIssueDescription;
