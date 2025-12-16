import { GoogleGenAI } from "@google/genai";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeConfigWithGemini = async (configText: string, apiKey?: string): Promise<string> => {
  // Prioritize the user-provided key, fallback to environment variable
  const effectiveKey = apiKey || process.env.API_KEY;

  if (!effectiveKey) {
    throw new Error("API Key is missing. Please provide it in the interface or set API_KEY in your environment.");
  }

  const ai = new GoogleGenAI({ apiKey: effectiveKey });
  let lastError: any;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
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
    } catch (error: any) {
      console.warn(`Gemini API Attempt ${attempt} failed:`, error);
      lastError = error;

      // Check for 503 Service Unavailable or "overloaded" messages
      const errorMessage = error.message || error.toString();
      const isOverloaded = errorMessage.includes('503') || errorMessage.toLowerCase().includes('overloaded');

      if (isOverloaded && attempt < MAX_RETRIES) {
        // Exponential backoff: 1s, 2s, 4s...
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`Model overloaded. Retrying in ${delay}ms...`);
        await wait(delay);
        continue;
      }

      // If it's not a 503 error, or we ran out of retries, break the loop
      break;
    }
  }

  // Final error handling after retries exhausted
  const finalMsg = lastError?.message || lastError?.toString() || "Unknown error";
  if (finalMsg.includes('503') || finalMsg.toLowerCase().includes('overloaded')) {
    throw new Error("The AI model is currently overloaded with high traffic. Please try again in a moment.");
  }

  console.error("Gemini API Fatal Error:", lastError);
  throw new Error(`Failed to analyze configuration: ${finalMsg}`);
};
