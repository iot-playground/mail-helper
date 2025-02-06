'use server'
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const getComanyRevenue = async (company: string, releavantContent: string[]) => {

    const prompt = `What was revenue for comany ${company} in 2023? Answer should be in EUR and only number. Additional info: ${releavantContent}`

    const { text } = await generateText({
        model: openai('gpt-4o-mini'),
        system: `You are a helpful assistant who is answering to question about company revenue.
        If no relevant information is found in the tool calls, respond with empay message "unknown"`,
        prompt: prompt,
    });

    console.log('revenueEur:', text);

    return text;
}