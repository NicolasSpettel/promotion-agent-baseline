import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// --- Interface Definitions ---

interface PromotionMetrics {
  revenue: number;
  roi: number;
  validations: number;
  promotionId: string;
}

interface PastPromotion {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

// --- Tool 1: Get Promotion Metrics ---

export const getPromotionMetricsTool = createTool({
  id: 'get-promotion-metrics',
  description: 'Fetch performance metrics for a specific promotion by its ID.',
  inputSchema: z.object({
    promotionId: z.string().describe('The unique ID of the promotion (e.g., PROMO-1)'),
  }),
  outputSchema: z.object({
    revenue: z.number(),
    roi: z.number(),
    validations: z.number(),
    promotionId: z.string(),
  }),
  execute: async ({ context }) => {
    return await getPromotionMetrics(context.promotionId);
  },
});

// --- Tool 2: List Past Promotions ---

export const listPastPromotionsTool = createTool({
  id: 'list-past-promotions',
  description: 'Retrieve a list of all historical and active promotions.',
  inputSchema: z.object({}), // No input required
  outputSchema: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    })
  ),
  execute: async () => {
    return await listPastPromotions();
  },
});

// --- Logic Helpers (Ready for API integration) ---

const getPromotionMetrics = async (promotionId: string): Promise<PromotionMetrics> => {
  // TODO: Replace with fetch('https://api.yourbackend.com/metrics/' + promotionId)
  console.log(`Fetching metrics for ${promotionId}...`);

  // Mocked response
  return {
    promotionId,
    revenue: 12000,
    roi: 2.4,
    validations: 530,
  };
};

const listPastPromotions = async (): Promise<PastPromotion[]> => {
  // TODO: Replace with fetch('https://api.yourbackend.com/promotions')
  console.log('Fetching past promotions list...');

  // Mocked response
  return [
    { id: 'PROMO-1', name: 'Black Friday', startDate: '2023-11-24', endDate: '2023-11-27' },
    { id: 'PROMO-2', name: 'Cyber Monday', startDate: '2023-11-28', endDate: '2023-11-28' },
    { id: 'PROMO-3', name: 'Christmas Sale', startDate: '2023-12-20', endDate: '2023-12-26' },
  ];
};