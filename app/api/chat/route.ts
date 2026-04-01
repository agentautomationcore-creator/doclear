import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getChatSystemPrompt } from '@/lib/ai';
import { createServiceClient, validateToken } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rate-limit';

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    const { user: authedUser, error: authError } = await validateToken(authHeader);
    if (authError || !authedUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Per-user rate limiting (burst protection) — persistent via Supabase RPC
    const allowed = await checkRateLimit(`chat:${authedUser.id}`, 30, 60);
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Server-side plan-based question limit (Free: 10/month)
    const supabaseAdmin = createServiceClient();
    const { data: canAsk } = await supabaseAdmin.rpc('can_ask_question', { p_user_id: authedUser.id });
    if (!canAsk) {
      return new Response(JSON.stringify({
        error: 'Monthly question limit reached. Upgrade to Pro for unlimited questions.',
        limit_reached: true,
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { question, document: doc, language, documentId, useSupabase, chatHistory: clientChatHistory } = await request.json();

    if (!question || !language) {
      return new Response(JSON.stringify({ error: 'Missing question or language' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Try to get page_texts from Supabase for richer context
    let pageTexts: Record<string, string> | undefined;
    let rawText: string | undefined;
    let analysisJson: string;
    let docTitle: string;

    if (documentId && useSupabase) {
      try {
        const supabase = createServiceClient();
        // Verify document belongs to authenticated user
        const { data: dbDoc } = await supabase
          .from('documents')
          .select('title, raw_text, page_texts, what_is_this, what_it_says, what_to_do, health_score, risk_flags, key_facts, doc_type, summary, amounts, deadline')
          .eq('id', documentId)
          .eq('user_id', authedUser.id)
          .single();

        if (dbDoc) {
          pageTexts = dbDoc.page_texts || undefined;
          rawText = dbDoc.raw_text || undefined;
          docTitle = dbDoc.title;
          analysisJson = JSON.stringify({
            summary: dbDoc.summary,
            what_is_this: dbDoc.what_is_this,
            what_it_says: dbDoc.what_it_says,
            what_to_do: dbDoc.what_to_do,
            health_score: dbDoc.health_score,
            risk_flags: dbDoc.risk_flags,
            key_facts: dbDoc.key_facts,
            doc_type: dbDoc.doc_type,
            amounts: dbDoc.amounts,
            deadline: dbDoc.deadline,
          });
        } else {
          return new Response(JSON.stringify({ error: 'Document not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } catch {
        return new Response(JSON.stringify({ error: 'Failed to load document' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      // No documentId provided — require it
      return new Response(JSON.stringify({ error: 'documentId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = getChatSystemPrompt(language, docTitle, analysisJson, pageTexts, rawText);

    const chatMessages: Anthropic.MessageParam[] = [];

    // Validate chat history roles — only allow 'user' and 'assistant'
    const history = clientChatHistory || [];
    const validHistory = history.filter((msg: any) =>
      msg.role && ['user', 'assistant'].includes(msg.role) && typeof msg.content === 'string'
    ).slice(-20); // Limit to 20 messages
    if (validHistory.length > 0) {
      for (const msg of validHistory) {
        chatMessages.push({ role: msg.role, content: msg.content });
      }
    }

    // Add current question
    chatMessages.push({ role: 'user', content: question });

    // Stream response
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: chatMessages,
    });

    // Convert to SSE stream
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const data = JSON.stringify({ type: 'delta', text: event.delta.text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          // Final message
          const finalMessage = await stream.finalMessage();
          const fullText = finalMessage.content
            .filter((b) => b.type === 'text')
            .map((b) => (b as any).text)
            .join('');

          // Chat messages are saved by the client (mobile app) — no server-side save to avoid duplicates

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', text: fullText })}\n\n`));
          controller.close();
        } catch (err: any) {
          const errorData = JSON.stringify({ type: 'error', error: err?.message || 'Chat failed' });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: 'Chat failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
