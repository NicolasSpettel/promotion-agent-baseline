import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { createPromotionLinkTool } from '../tools/promotion-tools';

// 1. Step to validate the business logic (e.g., is the discount too high?)
const validatePromotion = createStep({
  id: 'validate-promotion',
  inputSchema: z.object({
    discountPercentage: z.number().optional(),
    discountFlatValue: z.number().optional(),
  }),
  execute: async ({ inputData }) => {
    const isTooHigh = (inputData.discountPercentage || 0) > 50;
    if (isTooHigh) {
      throw new Error('Promotions over 50% require manual VP approval.');
    }
    return { status: 'validated' };
  },
});

// 2. Step to call your existing tool logic
const registerPromotion = createStep({
  id: 'register-promotion',
  execute: async ({ context }) => {
    // You can access data from previous steps via context
    const triggerData = context.getStepResult('trigger'); 
    // Logic to call your DB/Tool...
    return { url: 'https://store.com/p/123', id: 'PROMO-123' };
  },
});

// 3. The Workflow Definition
export const promotionWorkflow = createWorkflow({
  id: 'promotion-workflow',
  inputSchema: z.object({
    promotionName: z.string(),
    productIds: z.array(z.string()),
    discountPercentage: z.number().optional(),
  }),
})
  .step(validatePromotion)
  .then(registerPromotion);

promotionWorkflow.commit();