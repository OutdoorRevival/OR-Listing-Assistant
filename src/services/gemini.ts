export interface ListingSuggestion {
  title: string;
  category: string;
  description: string;
  suggestedPrice: string;
}

export async function generateListing(productName: string, condition: string): Promise<ListingSuggestion> {
  const response = await fetch("/api/generate-listing", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productName, condition }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate listing");
  }

  return response.json();
}
