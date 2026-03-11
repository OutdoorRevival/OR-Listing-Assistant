import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () => {
  // Vite's define plugin replaces these strings at build time
  const envKey = process.env.GEMINI_API_KEY;
  const viteKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Return the first one that is a non-empty string and not the literal "undefined"
  if (envKey && envKey !== 'undefined') return envKey;
  if (viteKey && viteKey !== 'undefined') return viteKey;
  
  return '';
};

const apiKey = getApiKey();

export interface ListingSuggestion {
  title: string;
  category: string;
  description: string;
  suggestedPrice: string;
}

const CATEGORIES = [
  "Men's", "Women's", "Kids", "Camping", "Backpacks", "Equipment", "Electronics", "Vanlife"
];

const SUB_CATEGORIES: Record<string, string[]> = {
  "Men's": ["Jackets & Outerwear", "Tops", "Bottoms", "Accessories", "Footwear"],
  "Women's": ["Jackets & Outerwear", "Tops", "Bottoms", "Accessories", "Footwear"],
  "Kids": ["Jackets & Outerwear", "Tops", "Bottoms", "Accessories", "Footwear"],
  "Camping": ["Tents", "Sleeping", "Camp kitchen", "Camp furniture", "Camp accessories"],
  "Backpacks": ["Backpacks up to 20L - Daypack", "Backpacks 21-40L - Multi-day", "Backpacks 41-60L - Camping", "Backpacks 61L Plus - Expedition", "Holdalls", "Ultralight / Running"],
  "Equipment": ["Trekking poles", "Navigation & maps", "Health & Safety", "Water bottles, flasks & filters", "Dog equipment"],
  "Electronics": ["GPS & Watches", "Lighting", "Headphones", "Cameras & Drones"],
  "Vanlife": ["Storage solutions", "Insulation", "Carpets, Mats & Protection", "Toppers & Bedding", "Bike racks, Roofbars & Accessories"]
};

export async function generateListing(productName: string, condition: string): Promise<ListingSuggestion> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please add it to your Vercel Environment Variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a listing for an outdoor gear item. 
    Search for the latest model of this product on the manufacturer's official website to ensure the technical specifications and description are accurate.
    
    Product Name: ${productName}
    Condition: ${condition}`,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: `You are an expert outdoor gear specialist for Outdoor Revival. 
      Your task is to help users list their items for sale by providing accurate, high-quality suggestions.
      
      CRITICAL INSTRUCTION:
      - Your primary source of information MUST be the manufacturer's official website for the product provided.
      - Always aim to provide specifications for the LATEST model of the item unless the user specifies an older version.
      - Ensure all technical details (weight, materials, features) are factually correct based on manufacturer data.

      Rules:
      1. Title format: Brand - Gender - Product Model - Size (UK)
      2. Category: Suggest a hierarchical category path (e.g., "Men's > Jackets & Outerwear > Down Jackets"). 
         - The top-level category MUST be one of: ${CATEGORIES.join(", ")}.
         - The second-level category SHOULD be one of the following based on the top-level:
           ${Object.entries(SUB_CATEGORIES).map(([cat, subs]) => `${cat}: ${subs.join(", ")}`).join("\n           ")}
         - You can add a third level for more specificity (e.g., "Men's > Jackets & Outerwear > Down Jackets").
      3. Description: Generate a professional and accurate description. 
         - State the condition exactly as provided: "${condition}". Do not embellish or assume details about the condition beyond this label.
         - MANDATORY: Include technical specifications such as weight (in grams/kg), materials (e.g., GORE-TEX, Pertex), insulation type (e.g., 800-fill down), and key features (e.g., helmet-compatible hood, YKK zips).
         - Use the manufacturer's official product copy as a reference for tone and accuracy.
         - Keep it concise but informative.
      4. Suggested Price: Estimate a fair resale price in GBP (£). 
         - Consider the estimated RRP for the item.
         - Adjust based on the condition (${condition}).
         - Factor in typical resale value for outdoor gear on platforms like eBay, Depop, or specialized gear swaps.
         - Return a single value or a small range (e.g., "£85" or "£80 - £90").
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

  return JSON.parse(response.text || "{}");
}
