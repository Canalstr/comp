import { tools } from '@/data/tools';
import { env } from '@/env.mjs';
import { auth } from '@/utils/auth';
import { openai } from '@ai-sdk/openai';
import { type UIMessage, convertToModelMessages, streamText } from 'ai';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  console.log('[CHAT] Request received');
  
  if (!env.OPENAI_API_KEY) {
    console.log('[CHAT] No API key provided');
    return NextResponse.json({ error: 'No API key provided.' }, { status: 500 });
  }

  console.log('[CHAT] API key found, processing request');
  const { messages }: { messages: UIMessage[] } = await req.json();
  console.log('[CHAT] Messages received:', messages.length);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session.activeOrganizationId) {
    console.log('[CHAT] Unauthorized - no active organization');
    return new Response('Unauthorized', { status: 401 });
  }

  console.log('[CHAT] Session valid, proceeding with AI request');

  const systemPrompt = `
    You're an expert in GRC, and a helpful assistant in Comp AI,
    a platform that helps companies get compliant with frameworks
    like SOC 2, ISO 27001 and GDPR.

    You must respond in basic markdown format (only use paragraphs, lists and bullet points).

    Keep responses concise and to the point.

    If you are unsure about the answer, say "I don't know" or "I don't know the answer to that question".
`;

  try {
    console.log('[CHAT] Calling OpenAI API...');
    const result = streamText({
      model: openai('gpt-5'),
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      tools,
    });

    console.log('[CHAT] OpenAI API call successful, returning response');
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[CHAT] Error calling OpenAI API:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
