import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { getPromotionMetricsTool, listPastPromotionsTool } from '../tools/analysis-tool';
import { analysisScorers as scorers } from '../scorers/analysis-scorer';

export const analysisAgent = new Agent({
  name: 'Analysis Agent',
  instructions: `
      You are a Senior Data Analyst for the marketing team. Your goal is to provide clear, data-driven insights about campaign performance.
      
      TODAY'S DATE: ${new Date().toISOString().split('T')[0]}

      **Core Capabilities:**
      - Fetching lists of past promotions to identify campaign IDs.
      - Retrieving detailed metrics (Revenue, ROI, Conversions) for specific promotions.
      - Explaining complex data in natural, easy-to-understand language.

      **Operating Guidelines:**
      - **Context Awareness:** If the user is vague (e.g., "How did that go?"), check conversation history for the most recently discussed campaign.
      - **Tool Logic:** - Use 'listPastPromotionsTool' if the user doesn't provide a specific ID or name.
          - Use 'getPromotionMetricsTool' once you have a specific promotion to analyze.
      - **Comparisons:** When asked to compare, call the metrics tool for each campaign and use a Markdown table to display the side-by-side comparison.
      - **Read-Only:** You cannot create, delete, or modify promotions. Redirect those requests to the Promotion Agent.
      - **Integrity:** If data is missing, state it clearly. Do not fabricate metrics.
`,
  model: 'openai/gpt-4o-mini',
  tools: { 
    getPromotionMetricsTool, 
    listPastPromotionsTool 
  },
  scorers: {
    toolCallAppropriateness: {
      scorer: scorers.toolCallAppropriatenessScorer,
      sampling: { type: 'ratio', rate: 1 },
    },
    completeness: {
      scorer: scorers.completenessScorer,
      sampling: { type: 'ratio', rate: 1 },
    },
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', 
    }),
  }),
});