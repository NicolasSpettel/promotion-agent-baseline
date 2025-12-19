import { z } from 'zod';
import { createToolCallAccuracyScorerCode, createCompletenessScorer } from '@mastra/evals/scorers/code';
import { createScorer } from '@mastra/core/scores';

// 1. Tool Call Accuracy Scorer
// Matches the baseline pattern using createToolCallAccuracyScorerCode
export const promotiontoolCallAppropriatenessScorer = createToolCallAccuracyScorerCode({
  expectedTool: 'create-promotion-link',
  strictMode: false,
});

// 2. Completeness Scorer
// Uses the standard Mastra implementation
export const promotioncompletenessScorer = createCompletenessScorer();

// 3. Custom LLM-judged Scorer: Promotion Creation Quality
// Evaluates if the agent collected all required fields before calling the tool
export const promotionCreationScorer = createScorer({
  name: 'Promotion Creation Accuracy',
  description: 'Checks if all required fields were collected and correctly formatted before tool execution.',
  type: 'agent',
  judge: {
    model: 'openai/gpt-4o-mini',
    instructions: `
      You are an expert evaluator of data collection tasks. 
      Your job is to verify if the assistant successfully gathered the necessary information for a promotion.
      Required fields: productIds, promotionName, startDate, endDate, and EXACTLY ONE of (discountPercentage OR discountFlatValue).
      Return only the structured JSON matching the provided schema.
    `,
  },
})
  .preprocess(({ run }) => {
    // Extract the arguments from the first tool call found in the run output
    const toolCallMessage = run.output?.find(
      (outputItem) => outputItem.toolCalls && outputItem.toolCalls.length > 0
    );

    const toolCallArgs = toolCallMessage?.toolCalls?.[0]?.args || {};
    return { toolCallArgs };
  })
  .analyze({
    description: 'Analyze the tool arguments for completeness and constraint satisfaction',
    outputSchema: z.object({
      allFieldsPresent: z.boolean(),
      mutuallyExclusiveDiscountValid: z.boolean(),
      explanation: z.string().default(''),
    }),
    createPrompt: ({ results }) => `
      Evaluate the following tool arguments provided by the assistant:
      
      Arguments:
      ${JSON.stringify(results.preprocessStepResult.toolCallArgs, null, 2)}

      Tasks:
      1) Are 'productIds', 'promotionName', 'startDate', and 'endDate' all present?
      2) Is there exactly one discount type provided (either 'discountPercentage' or 'discountFlatValue')?

      Return JSON:
      {
        "allFieldsPresent": boolean,
        "mutuallyExclusiveDiscountValid": boolean,
        "explanation": string
      }
    `,
  })
  .generateScore(({ results }) => {
    const r = (results as any)?.analyzeStepResult || {};
    
    if (r.allFieldsPresent && r.mutuallyExclusiveDiscountValid) return 1;
    if (r.allFieldsPresent || r.mutuallyExclusiveDiscountValid) return 0.5;
    
    return 0;
  })
  .generateReason(({ results, score }) => {
    const r = (results as any)?.analyzeStepResult || {};
    return `Promotion Scoring: Fields=${r.allFieldsPresent}, Discount Logic=${r.mutuallyExclusiveDiscountValid}. Final Score=${score}. ${r.explanation}`;
  });

export const promotionScorers = {
  promotiontoolCallAppropriatenessScorer,
  promotioncompletenessScorer,
  promotionCreationScorer,
};