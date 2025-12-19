import { z } from 'zod';
import { createToolCallAccuracyScorerCode, createCompletenessScorer } from '@mastra/evals/scorers/code';
import { createScorer } from '@mastra/core/scores';

// 1. Tool Call Accuracy Scorer
// Ensures the agent is using the metrics tool when data is requested
export const analysistoolCallAppropriatenessScorer = createToolCallAccuracyScorerCode({
  expectedTool: 'get-promotion-metrics',
  strictMode: false,
});

// 2. Completeness Scorer
export const analysisCompletenessScorer = createCompletenessScorer();

// 3. Custom LLM-judged Scorer: Analysis Insight Quality
// Evaluates if the agent interpreted the metrics correctly and used markdown tables
export const analysisAnalysisScorer = createScorer({
  name: 'Promotion Analysis Insight',
  description: 'Checks if the analyst interpreted tool data correctly and presented it via markdown tables.',
  type: 'agent',
  judge: {
    model: 'openai/gpt-4o-mini',
    instructions: `
      You are an expert data auditor. 
      Your job is to verify if the assistant provided a correct analysis based on tool outputs.
      The assistant should:
      - Use data returned from the 'get-promotion-metrics' tool.
      - Present comparisons or metrics in a Markdown table.
      - Provide a natural language summary that matches the numbers.
      Return only the structured JSON matching the provided schema.
    `,
  },
})
  .preprocess(({ run }) => {
    // Get the raw data the tool returned
    const toolResultMessage = run.output?.find(
      (outputItem) => outputItem.toolResults && outputItem.toolResults.length > 0
    );
    const toolData = toolResultMessage?.toolResults?.[0]?.result || {};
    
    // Get the assistant's final textual explanation
    const assistantResponse = run.output?.[run.output.length - 1]?.content || '';

    return { toolData, assistantResponse };
  })
  .analyze({
    description: 'Analyze if the response accurately reflects tool data and uses proper formatting.',
    outputSchema: z.object({
      dataAccuracy: z.boolean(),
      usesMarkdownTable: z.boolean(),
      explanation: z.string().default(''),
    }),
    createPrompt: ({ results }) => `
      Evaluate the assistant's final response against the data fetched from the tool.
      
      Tool Data (Source of Truth):
      ${JSON.stringify(results.preprocessStepResult.toolData, null, 2)}

      Assistant Response:
      "${results.preprocessStepResult.assistantResponse}"

      Tasks:
      1) Does the assistant's response include the correct numbers from the tool data?
      2) Does the response contain a Markdown table?

      Return JSON:
      {
        "dataAccuracy": boolean,
        "usesMarkdownTable": boolean,
        "explanation": string
      }
    `,
  })
  .generateScore(({ results }) => {
    const r = (results as any)?.analyzeStepResult || {};
    
    if (r.dataAccuracy && r.usesMarkdownTable) return 1;
    if (r.dataAccuracy) return 0.7; // Accurate data but poor formatting
    
    return 0;
  })
  .generateReason(({ results, score }) => {
    const r = (results as any)?.analyzeStepResult || {};
    return `Analysis Scoring: Accurate=${r.dataAccuracy}, Table Used=${r.usesMarkdownTable}. Final Score=${score}. ${r.explanation}`;
  });

export const analysisScorers = {
  analysistoolCallAppropriatenessScorer,
  analysisCompletenessScorer,
  analysisAnalysisScorer,
};