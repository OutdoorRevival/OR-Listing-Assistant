console.log("SERVER.TS STARTING...");
import express from "express";
import path from "path";
import sharetribeIntegrationSdk from "sharetribe-flex-integration-sdk";
import { GoogleGenAI, Type } from "@google/genai";

const { createInstance } = sharetribeIntegrationSdk;

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyDG0QSZvvyIk8xnHF_Z85STvLpq3LiGouY";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

let sdkInstance: any = null;

function getSharetribeSdk() {
  const clientId = process.env.SHARETRIBE_CLIENT_ID;
  const clientSecret = process.env.SHARETRIBE_CLIENT_SECRET;

  if (!clientId || clientId === "placeholder" || !clientSecret || clientSecret === "placeholder") {
    throw new Error("Sharetribe integration has not been configured yet (missing Client ID or Client Secret in environment).");
  }

  if (!sdkInstance) {
    sdkInstance = createInstance({
      clientId,
      clientSecret,
    });
  }
  return sdkInstance;
}

const apiRouter = express.Router();

// API route to recognize product from image
apiRouter.post("/gemini/recognize", async (req, res) => {
  const { base64Image, mimeType } = req.body;

  if (!base64Image || !mimeType) {
    res.status(400).json({ success: false, error: "Missing required fields: base64Image, mimeType" });
    return;
  }

  try {
    const ai = getGeminiClient();
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: "Examine this image carefully. Identify the outdoor gear item shown. Provide the most accurate product name possible, including brand, model, and gender. ONLY return the product name and gender (e.g., 'Rab Microlight Alpine Jacket - Men\'s'). DO NOT provide any explanations, reasoning, or additional text.",
        },
      ],
      config: {
        systemInstruction: "You are a world-class outdoor gear expert. Your goal is to provide highly accurate product identifications (Brand, Model, Gender) from photos. You MUST return ONLY the identification string and NOTHING else. No explanations, no conversation.",
      },
    });

    res.json({
      success: true,
      text: result.text?.trim() || "",
    });
  } catch (error: any) {
    console.error("Gemini Recognize Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to recognize product image.",
    });
  }
});

// API route to generate listing suggestion
apiRouter.post("/gemini/generate", async (req, res) => {
  const { productName, condition } = req.body;

  if (!productName || !condition) {
    res.status(400).json({ success: false, error: "Missing required fields: productName, condition" });
    return;
  }

  try {
    const ai = getGeminiClient();
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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

    let jsonSuggestion;
    try {
      jsonSuggestion = JSON.parse(result.text || "{}");
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON:", result.text);
      throw new Error("Model response was not in valid JSON format.");
    }

    res.json({
      success: true,
      suggestion: jsonSuggestion,
    });
  } catch (error: any) {
    console.error("Gemini Generate Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate listing suggestion.",
    });
  }
});

// API route to create a draft listing
apiRouter.post("/sharetribe/create-draft", async (req, res) => {
  const { title, description, price, category } = req.body;

  try {
    // Convert price string (e.g., "£85") to cents/pence
    const priceValue = parseInt(price.replace(/[^0-9]/g, ""), 10) * 100;

    const sdk = getSharetribeSdk();
    const response = await sdk.listings.create({
      title,
      description,
      price: { amount: priceValue, currency: "GBP" },
      state: "draft",
      publicData: {
        categoryPath: category,
        generatedBy: "Outdoor Revival AI Assistant"
      }
    });

    res.json({ 
      success: true, 
      listingId: response.data.data.id.uuid,
    });
  } catch (error: any) {
    console.error("Sharetribe API Error:", error.status, error.statusText, error.data);
    res.status(500).json({ 
      success: false, 
      error: error.data?.errors?.[0]?.details || "Failed to create Sharetribe listing" 
    });
  }
});

app.use("/api", apiRouter);
app.use("/", apiRouter);

// Vite middleware or static asset hosting
async function mountViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only listen if not running in Vercel Serverless environment
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

mountViteOrStatic().catch((err) => {
  console.error("Failed to mount app / listen:", err);
});

export default app;
