import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// --- Interface Definitions ---

interface PromotionResult {
  promotionId: string;
  url: string;
  status: string;
}

// --- Tool Definition ---

export const createPromotionLinkTool = createTool({
  id: 'create-promotion-link',
  description: 'Generates and registers a new promotional link in the backend based on provided details.',
  inputSchema: z.object({
    productIds: z.array(z.string()).describe('List of product IDs this promotion applies to.'),
    promotionName: z.string().describe('The internal name for the promotion.'),
    startDate: z.string().describe('The start date of the promotion (ISO 8601 format).'),
    endDate: z.string().describe('The end date of the promotion (ISO 8601 format).'),
    discountPercentage: z.number().optional().describe('Percentage discount (e.g., 20 for 20%).'),
    discountFlatValue: z.number().optional().describe('Flat currency value discount (e.g., 10 for $10).'),
  }),
  outputSchema: z.object({
    promotionId: z.string(),
    url: z.string().url(),
    status: z.string(),
  }),
  execute: async ({ context }) => {
    // We pass the structured context directly to the logic function
    return await createPromotion(context);
  },
});

// --- Logic Helper ---

const createPromotion = async (data: {
  productIds: string[];
  promotionName: string;
  startDate: string;
  endDate: string;
  discountPercentage?: number;
  discountFlatValue?: number;
}): Promise<PromotionResult> => {
  
  // In a real scenario, this is where you would call your API or DB
  // For now, we simulate the backend logic
  const companyId = 'CMP-999'; 
  console.log(`Processing promotion "${data.promotionName}" for company ${companyId}`);

  const newPromotionId = `PROMO-${Math.random().toString(36).substring(7).toUpperCase()}`;
  
  // Logic to determine the URL or further register the promotion
  const generatedUrl = `https://store.com/p/${newPromotionId}`;

  return {
    promotionId: newPromotionId,
    url: generatedUrl,
    status: 'active',
  };
};