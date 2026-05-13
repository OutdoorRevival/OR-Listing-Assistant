console.log("SERVER.TS STARTING...");
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'undefined' || apiKey === 'null') {
      throw new Error("GEMINI_API_KEY is not set or is 'undefined'. Please set it in the Settings menu.");
    }
    return new GoogleGenAI({ apiKey: apiKey.trim() });
  };

  // Gemini Endpoints
  app.post("/api/gemini/recognize", async (req, res) => {
    try {
      const { base64Image, mimeType } = req.body;
      const ai = getAi();
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: "Examine this image carefully. Identify the outdoor gear item shown. Provide the most accurate product name possible, including brand, model, and gender. ONLY return the product name and gender (e.g., 'Rab Microlight Alpine Jacket - Men's'). DO NOT provide any explanations, reasoning, or additional text.",
          },
        ],
        config: {
          systemInstruction: "You are a world-class outdoor gear expert. Your goal is to provide highly accurate product identifications (Brand, Model, Gender) from photos. You MUST return ONLY the identification string and NOTHING else. No explanations, no conversation.",
        },
      });
      res.json({ text: result.text?.trim() || "" });
    } catch (error: any) {
      console.error("Gemini Recognize Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/suggest", async (req, res) => {
    try {
      const { productName, condition } = req.body;
      const ai = getAi();
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a listing for an outdoor gear item. 
        Search for the latest model of this product on the manufacturer's official website to ensure the technical specifications and description are accurate.
        
        Product Name: ${productName}
        Condition: ${condition}`,
        config: {
          systemInstruction: `You are an expert outdoor gear specialist for Outdoor Revival. 
          Your task is to help users list their items for sale by providing accurate, high-quality suggestions.
          
          CRITICAL INSTRUCTION:
          - Your primary source of information MUST be the manufacturer's official website for the product provided.
          - Always aim to provide specifications for the LATEST model of the item unless the user specifies an older version.
          - Ensure all technical details (weight, materials, features) are factually correct based on manufacturer data.

          Rules:
          1. Title format: Brand - Gender - Product Model - Size (UK)
          2. Category: Suggest a hierarchical category path (e.g., "Men's > Jackets & Outerwear > Down Jackets"). 
          3. Description: Generate a professional and accurate description. 
             - DO NOT include any information about the condition of the item in the description.
             - MANDATORY: Include technical specifications such as weight, materials, and key features.
          4. Suggested Price: Estimate a fair resale price in GBP (£) based on the provided condition. 
          5. If size or gender is missing from the input, make a best guess based on the product name or use "N/A" or "Unisex".`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              suggestedPrice: { type: Type.STRING },
            },
            required: ["title", "category", "description", "suggestedPrice"],
          },
        },
      });
      res.json(JSON.parse(result.text || "{}"));
    } catch (error: any) {
      console.error("Gemini Suggest Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
