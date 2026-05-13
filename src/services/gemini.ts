export interface ListingSuggestion {
  title: string;
  category: string;
  description: string;
  suggestedPrice: string;
}

export async function recognizeProductFromImage(base64Image: string, mimeType: string): Promise<string> {
  const response = await fetch("/api/gemini/recognize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Image, mimeType }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to recognize product");
  }

  const data = await response.json();
  return data.text;
}

export async function generateListing(productName: string, condition: string): Promise<ListingSuggestion> {
  const response = await fetch("/api/gemini/suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productName, condition }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate listing");
  }

  return response.json();
}
