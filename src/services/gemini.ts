export interface ListingSuggestion {
  title: string;
  category: string;
  description: string;
  suggestedPrice: string;
}

export async function recognizeProductFromImage(base64Image: string, mimeType: string): Promise<string> {
  const response = await fetch("/api/gemini/recognize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ base64Image, mimeType }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to recognize product image.");
  }

  return data.text;
}

export async function generateListing(productName: string, condition: string): Promise<ListingSuggestion> {
  const response = await fetch("/api/gemini/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productName, condition }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to generate listing suggestion.");
  }

  return data.suggestion;
}
