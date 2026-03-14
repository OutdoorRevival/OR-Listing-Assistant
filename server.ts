console.log("SERVER.TS STARTING...");
import express from "express";
import { createServer as createViteServer } from "vite";
import sharetribeIntegrationSdk from "sharetribe-flex-integration-sdk";

const { createInstance } = sharetribeIntegrationSdk;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Sharetribe Integration SDK
  const sdk = createInstance({
    clientId: process.env.SHARETRIBE_CLIENT_ID || "placeholder",
    clientSecret: process.env.SHARETRIBE_CLIENT_SECRET || "placeholder",
  });

  // API route to create a draft listing
  app.post("/api/sharetribe/create-draft", async (req, res) => {
    const { title, description, price, category } = req.body;

    try {
      // Convert price string (e.g., "£85") to cents/pence
      const priceValue = parseInt(price.replace(/[^0-9]/g, ""), 10) * 100;

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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
