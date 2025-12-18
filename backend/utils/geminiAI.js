// backend/utils/geminiAI.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';
import ErrorHandler from "../middlewares/error.js";
import dotenv from 'dotenv';
dotenv.config({ path: './config/config.env' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
console.log("Initializing Gemini AI with key:", process.env.GEMINI_API_KEY ? 'Key present' : 'Key missing');
if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in environment variables.");
    throw new Error("GEMINI_API_KEY is missing. Please set it in the .env file.");
}

// Helper function to convert image URL to base64
const urlToGenerativePart = async (url, mimeType) => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        return {
            inlineData: {
                data: base64,
                mimeType,
            },
        };
    } catch (error) {
        console.error("Error converting image URL to base64:", error);
        throw new Error("Failed to process the resume image.");
    }
};

// Retry logic wrapper for API calls
const withRetry = async (apiCall, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await apiCall();
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Gemini API call attempt ${i + 1} failed:`, error.message);
            if (i === maxRetries - 1) {
                console.error(`[${new Date().toISOString()}] All Gemini API retries failed.`);
                throw new ErrorHandler("The AI service is currently unavailable. Please try again later.", 503);
            }
            await new Promise(res => setTimeout(res, 1000 * (i + 1)));
        }
    }
};

export const geminiAI = {
    // Calculates compatibility based on resume (image) and job description
    calculateCompatibility: async ({ resumeUrl, mimeType, jobDescription }) => {
        return withRetry(async () => {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const imagePart = await urlToGenerativePart(resumeUrl, mimeType);
            const prompt = `Based on the attached resume and the following job description, provide a job compatibility score from 0 to 100. Also, give a brief, one-sentence feedback for the applicant. Return the result as a JSON object with keys "score" and "feedback".\n\nJob Description: ${jobDescription}`;
            
            const result = await model.generateContent([prompt, imagePart]);
            const responseText = result.response.text().replace(/```json|```/g, '').trim();
            const parsedResponse = JSON.parse(responseText);

            return {
                score: parseInt(parsedResponse.score, 10) || 0,
                feedback: parsedResponse.feedback || "AI analysis completed."
            };
        });
    },

    // Gets job recommendations based on resume (image)
    getJobRecommendations: async ({ resumeUrl, mimeType, jobs }) => {
        return withRetry(async () => {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const imagePart = await urlToGenerativePart(resumeUrl, mimeType);
            const jobDetails = jobs.map(j => `ID: ${j.id}, Title: ${j.title}, Description: ${j.description}, Niche: ${j.niche}`).join('\n');
            const prompt = `From the attached resume, analyze the candidate's skills and experience. Based on this analysis, recommend the best-matching jobs from the following list. For each match, provide a one-sentence reason. Return a JSON array of objects, each with keys "id" and "reason".\n\nJob List:\n${jobDetails}`;

            const result = await model.generateContent([prompt, imagePart]);
            const responseText = result.response.text().replace(/```json|```/g, '').trim();
            return JSON.parse(responseText);
        });
    },

    // Gets job recommendations based on user profile data
    getPersonalizedJobRecommendations: async ({ skills, experience, jobs }) => {
        return withRetry(async () => {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const jobDetails = jobs.map(j => `ID: ${j.id}, Title: ${j.title}, Description: ${j.description}, Niche: ${j.niche}`).join('\n');
            const prompt = `A user has the following profile:\n- Skills/Niches: ${skills.join(', ')}\n- Experience Summary: ${experience}\n\nBased on their profile, recommend the best-matching jobs from the list below. For each match, provide a one-sentence reason. Return a JSON array of objects, each with keys "id" and "reason".\n\nJob List:\n${jobDetails}`;
            
            const result = await model.generateContent(prompt);
            const responseText = result.response.text().replace(/```json|```/g, '').trim();
            return JSON.parse(responseText);
        });
    },

    // Gets career advice based on a user's profile and query
    getCareerAdvice: async ({ userProfile, query }) => {
        return withRetry(async () => {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const prompt = `A user with the role of '${userProfile.role}' needs career advice. Their profile includes skills in [${userProfile.niches.firstNiche}, ${userProfile.niches.secondNiche}, ${userProfile.niches.thirdNiche}]. They are asking: "${query}". Provide a helpful, encouraging, and concise response.`;
            
            const result = await model.generateContent(prompt);
            return result.response.text();
        });
    },

    // Suggests endorsements based on user profile and shared experiences
    suggestEndorsements: async ({ userProfile, endorserProfile, sharedNiche }) => {
        return withRetry(async () => {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const prompt = `Based on the following profiles, suggest 3-5 specific skills that would be appropriate for endorsement:
            
            User Profile:
            - Role: ${userProfile.role}
            - Niches: ${userProfile.niches.firstNiche}, ${userProfile.niches.secondNiche}, ${userProfile.niches.thirdNiche}
            - Career Goals: ${userProfile.careerGoals || 'Not specified'}
            
            Endorser Profile:
            - Role: ${endorserProfile.role}
            - Niches: ${endorserProfile.niches.firstNiche}, ${endorserProfile.niches.secondNiche}, ${endorserProfile.niches.thirdNiche}
            
            Shared Niche: ${sharedNiche}
            
            Return a JSON array of skill suggestions, each with a "skill" and "reason" field. Focus on skills that the endorser could reasonably validate based on their relationship or shared work.`;
            
            const result = await model.generateContent(prompt);
            const responseText = result.response.text().replace(/```json|```/g, '').trim();
            return JSON.parse(responseText);
        });
    },

    // Generates group post suggestions based on user's niche and interests
    generateGroupPostSuggestions: async ({ userProfile, groupNiche, postType }) => {
        return withRetry(async () => {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const prompt = `Generate 3 engaging ${postType} post ideas for a professional group focused on ${groupNiche}.
            
            User Profile:
            - Role: ${userProfile.role}
            - Niches: ${userProfile.niches.firstNiche}, ${userProfile.niches.secondNiche}, ${userProfile.niches.thirdNiche}
            
            Post Type: ${postType}
            Group Niche: ${groupNiche}
            
            Return a JSON array with "title" and "content" for each post idea. Make them relevant, engaging, and professional.`;
            
            const result = await model.generateContent(prompt);
            const responseText = result.response.text().replace(/```json|```/g, '').trim();
            return JSON.parse(responseText);
        });
    },

    // Suggests relevant events based on user profile
    suggestRelevantEvents: async ({ userProfile, availableEvents }) => {
        return withRetry(async () => {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const eventDetails = availableEvents.map(e => `ID: ${e.id}, Title: ${e.title}, Niche: ${e.niche}, Type: ${e.type}, Date: ${e.date}`).join('\n');
            
            const prompt = `Based on the user's profile, recommend the most relevant events from the following list:
            
            User Profile:
            - Role: ${userProfile.role}
            - Niches: ${userProfile.niches.firstNiche}, ${userProfile.niches.secondNiche}, ${userProfile.niches.thirdNiche}
            - Career Goals: ${userProfile.careerGoals || 'Not specified'}
            
            Available Events:
            ${eventDetails}
            
            Return a JSON array of recommended events, each with "id" and "reason" fields. Prioritize events that align with the user's niches and career goals.`;
            
            const result = await model.generateContent(prompt);
            const responseText = result.response.text().replace(/```json|```/g, '').trim();
            return JSON.parse(responseText);
        });
    }
};