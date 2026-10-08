import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, image } = req.body || {};
    if (!prompt && !image) {
      return res.status(400).json({ error: "Prompt or image is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in the deployment environment."
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const parts = [];
    if (prompt) parts.push({ text: prompt });

    if (image?.data && image?.mimeType) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction:
          "You are VisionChat AI, a helpful multimodal assistant. Analyze user-provided images accurately. " +
          "Do not claim certainty when visual details are unclear. Answer clearly and concisely.",
      }
    });

    return res.status(200).json({ text: response.text || "I couldn't generate a response." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "AI request failed. Check the API key and deployment logs." });
  }
}
