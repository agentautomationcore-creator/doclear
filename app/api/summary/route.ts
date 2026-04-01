import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSummarySystemPrompt, parseAnalysisResponse } from '@/lib/ai';
import { validateToken, createServiceClient } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rate-limit';

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { user: authedUser, error: authError } = await validateToken(authHeader);
    if (authError || !authedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowed = await checkRateLimit(`summary:${authedUser.id}`, 10, 60);
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
    }

    const { documents, language } = await request.json();

    if (!documents || !language) {
      return NextResponse.json({ error: 'Missing documents or language' }, { status: 400 });
    }

    const docsText = documents.map((d: any, i: number) =>
      `Document ${i + 1}: "${d.title}" | Category: ${d.category} | Deadline: ${d.deadline || 'none'} | Urgency: ${d.urgency} | Amounts: ${d.amounts?.join(', ') || 'none'}`
    ).join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: getSummarySystemPrompt(language),
      messages: [{
        role: 'user',
        content: `Summarize these ${documents.length} documents:\n\n${docsText}`,
      }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    const summary = parseAnalysisResponse(textBlock.text);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Summary error:', error);
    return NextResponse.json({ error: 'Summary failed' }, { status: 500 });
  }
}
