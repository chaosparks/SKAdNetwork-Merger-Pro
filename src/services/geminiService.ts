import { GoogleGenAI } from "@google/genai";

export const analyzeConfigWithGemini = async (configText: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set it in your environment.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert iOS AdTech engineer. Analyze the following SKAdNetworkItems XML/JSON configuration.
      1. Check if the XML structure is valid.
      2. Identify which major ad networks these IDs likely belong to (e.g., Google, Unity, AppLovin, IronSource) based on common prefixes or known IDs if possible.
      3. Point out any duplicates or malformed IDs.
      4. Provide a brief summary.

      Configuration:
      \`\`\`
      ${configText.substring(0, 10000)}
      \`\`\`
      `,
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze configuration with Gemini.");
  }
};
