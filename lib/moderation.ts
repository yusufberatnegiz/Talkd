import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function moderateMessage(text: string): Promise<{
  isSafe: boolean;
  isCrisis: boolean;
}> {
  const result = await openai.moderations.create({ input: text });
  const output = result.results[0];
  const isCrisis = Boolean(
    output.categories['self-harm'] ||
    output.categories['self-harm/intent'] ||
    output.categories['self-harm/instructions']
  );
  return { isSafe: !output.flagged, isCrisis };
}
