import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { scorers } from '../scorers/promotion-scorer';
import { createPromotionLinkTool } from '../tools/promotion-tools'; 

export const promotionAgent = new Agent({
  name: 'Promotion Creation Agent',
  instructions: `
      You are a specialized assistant that helps users create promotion links. Your primary goal is to collect the required data fields efficiently.

      **Required Fields:**
      - productIds (The IDs of the products included)
      - promotionName (A descriptive name for the campaign)
      - startDate (ISO format)
      - endDate (ISO format)
      - Discount (Must have either discountPercentage OR discountFlatValue)

      **Guidelines:**
      - If the user provides relative dates like "today", "tomorrow", or holiday names (e.g., "New Year's Day"), automatically convert them to ISO format and confirm the date with the user.
      - Extract all available fields from the user's initial message.
      - Only ask for the specific missing fields.
      - DO NOT ask for: promotion type, target audience, services, or marketing copy.
      - Once ALL required fields are collected, call the 'createPromotionLinkTool' immediately.

      Keep your tone professional and focused on completing the data collection.
`,
  model: 'openai/gpt-4o-mini',
  tools: { 
    createPromotionLinkTool 
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