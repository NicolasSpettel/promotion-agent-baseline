import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// --- Interface Definitions ---

interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
}

interface SearchResponse {
  products: Product[];
}

// --- Tool Definition ---

export const searchProductsTool = createTool({
  id: 'search-products',
  description: 'Searches the product catalog by name or category to retrieve product details and IDs.',
  inputSchema: z.object({
    query: z.string().describe('The search term (e.g., "summer dress", "shoes", "electronics").'),
  }),
  outputSchema: z.object({
    products: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
      })
    ),
  }),
  execute: async ({ context }) => {
    return await searchProducts(context.query);
  },
});

// --- Logic Helper (Mocked for DB/API integration) ---

const searchProducts = async (query: string): Promise<SearchResponse> => {
  // TODO: Replace with a call to your database (Prisma, Drizzle, etc.) or Search API (Algolia, Elasticsearch)
  console.log(`Searching catalog for: "${query}"...`);

  // Mocked Database Results
  const mockCatalog: Product[] = [
    { id: 'P-101', name: 'Summer Floral Dress', price: 50, category: 'Apparel' },
    { id: 'P-102', name: 'Summer Beach Hat', price: 20, category: 'Accessories' },
    { id: 'P-103', name: 'Running Shoes', price: 85, category: 'Footwear' },
    { id: 'P-104', name: 'Denim Jacket', price: 120, category: 'Apparel' },
  ];

  // Simple filter logic to simulate a search
  const results = mockCatalog.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.category?.toLowerCase().includes(query.toLowerCase())
  );

  return {
    products: results,
  };
};