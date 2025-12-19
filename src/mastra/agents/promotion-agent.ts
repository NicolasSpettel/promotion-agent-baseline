import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { promotionScorers as scorers} from '../scorers/promotion-scorer';
import { createPromotionLinkTool } from '../tools/promotion-tool'; 
import { searchProductsTool } from '../tools/product-search-tool';

export const promotionAgent = new Agent({
  name: 'Promotion Creation Agent',
  instructions: `
      You are a specialized marketing assistant. Your goal is to collect campaign data and register promotions.
      
      TODAY'S DATE: ${new Date().toISOString().split('T')[0]}

      **Core Protocol:**
      1. **Search First:** If the user mentions product names (e.g., "summer dresses") instead of IDs (e.g., "P-101"), you MUST call 'search-products' first to find the correct IDs.
      2. **Data Collection:** Ensure you have:
         - productIds (extracted from search or user)
         - promotionName
         - startDate & endDate (ISO format)
         - One discount type (Percentage or Flat Value)
      3. **Handoff:** Once data is complete, call 'create-promotion-link'. 

      **Guidelines:**
      - If 'search-products' returns multiple items, ask the user to confirm which ones to include.
      - Convert relative dates (e.g., "next Friday") to ISO strings based on Today's Date.
      - Keep it brief. Do not ask for marketing copy or target audience.
`,
  model: 'openai/gpt-4o-mini',
  tools: { 
    createPromotionLinkTool,
    searchProductsTool 
  },
  scorers: {
    toolCallAppropriateness: {
      scorer: scorers.toolCallAppropriatenessScorer,
      sampling: {
        type: 'ratio',
        rate: 1,
      },
    },
    completeness: {
      scorer: scorers.completenessScorer,
      sampling: {
        type: 'ratio',
        rate: 1,
      },
    },
    promotionClarity: {
      scorer: scorers.promotionCreationScorer,
      sampling: {
        type: 'ratio',
        rate: 1,
      },
    },
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', 
    }),
  }),
});