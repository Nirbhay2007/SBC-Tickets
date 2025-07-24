import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

export async function summarize(textArray) {
  try {
    const response = await openai.createCompletion({
      model: 'gpt-4o',
      prompt: `Summarize the following messages in 500 characters or less:\n${textArray.join('\n')}`,
      max_tokens: 500,
    });
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error summarizing messages:', error);
    throw new Error('Failed to generate summary.');
  }
}
