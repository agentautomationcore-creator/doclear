import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getChatSystemPrompt } from '@/lib/ai';
import { createServiceClient } from '@/lib/supabase';

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { question, document: doc, language, documentId, useSupabase } = await request.json();

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
        const { data: dbDoc } = await supabase
          .from('documents')
          .select('title, raw_text, page_texts, what_is_this, what_it_says, what_to_do, health_score, risk_flags, key_facts, doc_type, summary, amounts, deadline')
          .eq('id', documentId)
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
          docTitle = doc?.title || 'Document';
          analysisJson = JSON.stringify({
            what_is_this: doc?.whatIsThis,
            what_it_says: doc?.whatItSays,
            what_to_do: doc?.whatToDo,
          });
        }
      } catch {
        docTitle = doc?.title || 'Document';
        analysisJson = JSON.stringify({
          what_is_this: doc?.whatIsThis,
          what_it_says: doc?.whatItSays,
          what_to_do: doc?.whatToDo,
        });
      }
    } else {
      // Fallback: use client-side data
      docTitle = doc?.title || 'Document';
      pageTexts = doc?.pageTexts;
      rawText = doc?.rawText;
      analysisJson = JSON.stringify({
        what_is_this: doc?.whatIsThis,
        what_it_says: doc?.whatItSays,
        what_to_do: doc?.whatToDo,
        health_score: doc?.healthScore,
        risk_flags: doc?.riskFlags,
        key_facts: doc?.keyFacts,
        summary: doc?.summary,
      });
    }

    const systemPrompt = getChatSystemPrompt(language, docTitle, analysisJson, pageTexts, rawText);

    const chatMessages: Anthropic.MessageParam[] = [];

    // Add chat history
    if (doc?.chatHistory && doc.chatHistory.length > 0) {
      for (const msg of doc.chatHistory) {
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

          // Save chat messages to Supabase
          if (documentId && doc?.userId) {
            try {
              const supabase = createServiceClient();
              await supabase.from('chat_messages').insert([
                { document_id: documentId, user_id: doc.userId, role: 'user', content: question },
                { document_id: documentId, user_id: doc.userId, role: 'assistant', content: fullText },
              ]);
            } catch {}
          }

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
