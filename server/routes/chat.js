import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authMiddleware } from '../utils/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini AI (lazy load)
let genAI = null; const initializeGenAI = () => {
    if (!genAI && process.env.GEMINI_API_KEY) {
        try {
            genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            console.log('✅ Gemini AI client initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Gemini AI:', error);
        }
    }
    return genAI;
};

// Load application documentation
let applicationDocs = '';
try {
    const docsPath = path.join(__dirname, '../docs/application-docs.md');
    applicationDocs = fs.readFileSync(docsPath, 'utf-8');
    console.log('✅ Application documentation loaded successfully');
} catch (error) {
    console.error('❌ Failed to load application documentation:', error);
}

/**
 * POST /api/chat/message
 * Send a message to Gemini AI and get a response
 */
router.post('/message', authMiddleware, async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        const userRole = req.user.role; // 'admin' or 'agent'
        const userName = req.user.name;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Check if Gemini AI is configured
        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ GEMINI_API_KEY not configured');
            return res.status(500).json({
                error: 'Chat service is not configured. Please contact your administrator.'
            });
        }

        initializeGenAI();

        if (!genAI) {
            console.error('❌ Gemini AI client not initialized');
            return res.status(500).json({
                error: 'Chat service is not available. Please try again later.'
            });
        }

        // Check for password change requests
        const passwordChangeKeywords = [
            'password', 'change password', 'reset password',
            'forgot password', 'update password', 'modify password',
            'change my password', 'reset my password'
        ];

        const isPasswordChangeRequest = passwordChangeKeywords.some(keyword =>
            message.toLowerCase().includes(keyword)
        );

        if (isPasswordChangeRequest) {
            let response = '';
            if (userRole === 'agent') {
                response = "I understand you want to change your password. As an agent, you'll need to contact your admin to reset your password. Your admin can help you with this request.";
            } else if (userRole === 'admin') {
                response = "I understand you want to change your password. As an admin, please send an email to **support@alpever.space** with your registered email address, and our support team will assist you with the password reset process.";
            }

            return res.json({
                response,
                isPasswordChangeRequest: true
            });
        }

        // Create system prompt with application context
        const systemPrompt = `You are Alpever AI, a helpful AI assistant for the Service Link Pro application. 

Your role is to help users understand and navigate the application, answer questions about processes, features, and workflows.

IMPORTANT RULES:
1. Your name is "Alpever AI" - always introduce yourself as such when asked
2. Only answer questions related to the Service Link Pro application and its processes
3. Use the application documentation provided below as your knowledge base
4. Be concise, helpful, and professional
5. If a question is not related to the application or its processes, politely decline and suggest contacting support@alpever.space
6. Current user's role: ${userRole}
7. Current user's name: ${userName}

APPLICATION DOCUMENTATION:
${applicationDocs}

When answering:
- Be specific and reference features/pages from the documentation
- Provide step-by-step instructions when applicable
- Use bullet points for clarity
- Mention relevant navigation paths (e.g., "Navigate to /service-calls")
- If you're unsure, admit it and suggest contacting support

For non-relevant questions (not about Service Link Pro):
Respond with: "I'm Alpever AI, and I'm specifically designed to help with Service Link Pro application queries. For questions outside of this application, please contact our support team at support@alpever.space."`;

        // Build conversation history for context
        const chatHistory = conversationHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // Initialize the model
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        });

        // Start chat with history
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'I understand. I am Alpever AI, your assistant for Service Link Pro. I will help users with application-related queries based on the documentation provided, and I will politely decline non-relevant questions.' }]
                },
                ...chatHistory
            ],
        });

        // Send message and get response
        const result = await chat.sendMessage(message);
        const response = result.response.text();

        res.json({
            response,
            isPasswordChangeRequest: false
        });

    } catch (error) {
        console.error('Chat error:', error);

        // Handle specific Gemini API errors
        if (error.message?.includes('API key')) {
            return res.status(500).json({
                error: 'AI service configuration error. Please contact support.'
            });
        }

        if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
            return res.status(429).json({
                error: 'AI service is temporarily busy. Please try again in a moment.'
            });
        }

        res.status(500).json({
            error: 'Failed to process your message. Please try again.'
        });
    }
});

/**
 * GET /api/chat/health
 * Check if chat service is available
 */
router.get('/health', (req, res) => {
    initializeGenAI();
    const isConfigured = !!process.env.GEMINI_API_KEY;
    const docsLoaded = applicationDocs.length > 0;

    res.json({
        status: isConfigured && docsLoaded ? 'healthy' : 'unhealthy',
        geminiConfigured: isConfigured,
        documentationLoaded: docsLoaded,
        documentationSize: applicationDocs.length
    });
});

export default router;
