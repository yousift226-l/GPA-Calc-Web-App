import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai"; // The 2026 official Google AI SDK


// Load variables from .env (like your API key) into process.env
dotenv.config();

const app = express();

// MIDDLEWARE: 
// Allows the server to parse JSON data sent from your frontend
app.use(express.json()); 
// Tells Express to serve your HTML, CSS, and JS files from the current folder
app.use(express.static("."));

// --- AI CONFIGURATION ---
// Initialize the Gemini client using the key stored safely in your .env file
const aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- API ENDPOINT ---
// This is the "address" your frontend calls: http://localhost:3000/api/chat
app.post("/api/chat", async (req, res) => {
  try {
    // 1. EXTRACT: Get the user's text from the request body
    const userMessage = req.body?.message;

    // 2. VALIDATE: If the message is missing, send a 400 error back
    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 3. CONSTRUCT: This is "Prompt Engineering." 
    // We wrap the user's message with instructions so the AI stays on topic (GPA/Grades).
    const prompt = `You are a GPA calculator assistant. Only answer questions related to grades, credits, and GPA calculation. User says: ${userMessage}`;

    // 4. GENERATE: Send the prompt to the Gemini 2.5 Flash-Lite model
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash-lite", // The standard free-tier model for 2026
      contents: prompt,
    });

    // 5. RESPOND: Send the AI's text back to your frontend as a JSON object
    // Your frontend looks specifically for the "reply" key.
    return res.json({ reply: response.text });

  } catch (err) {
    // If anything fails (API key wrong, internet out, etc.), log the error
    console.error("Gemini Error:", err);
    return res.status(500).json({
      error: "AI request failed."
    });
  }
});

// --- START THE SERVER ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});