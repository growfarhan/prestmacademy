
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Initializing with the API_KEY from environment variables directly as per instructions
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateDescription(title: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a professional and engaging 2-sentence description for an e-learning course titled: "${title}"`,
      });
      // Correctly accessing the text property as defined in the guidelines
      return response.text || "No description generated.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "An error occurred while generating the description.";
    }
  }

  async generateLessonPlan(courseTitle: string): Promise<any> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a 3-lesson curriculum for a course titled "${courseTitle}". Return only a valid JSON array of objects with "title" and "description" keys.`,
        config: {
          responseMimeType: "application/json"
        }
      });
      // Correctly accessing the text property
      return JSON.parse(response.text || '[]');
    } catch (error) {
      console.error("Gemini Error:", error);
      return [];
    }
  }
}

export const geminiService = new GeminiService();
