import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getChatSystemPrompt } from '@/lib/ai';

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { question, document: doc, language } = await request.json();

    if (!question || !doc || !language) {
      return NextResponse.json(
        { error: 'Missing question, document, or language' },
        { status: 400 }
      );
    }

    const analysisJson = JSON.stringify({
      what_is_this: doc.whatIsThis,
      what_it_says: doc.whatItSays,
      what_to_do: doc.whatToDo,
      deadline: doc.deadline,
      amounts: doc.amounts,
    });

    const messages: Anthropic.MessageParam[] = [];

    // Add chat history if any
    if (doc.chatHistory && doc.chatHistory.length > 0) {
      for (const msg of doc.chatHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add current question
    messages.push({
      role: 'user',
      content: question,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 800,
      system: getChatSystemPrompt(language, doc.title, analysisJson),
      messages,
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({ answer: textBlock.text });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Chat failed' },
      { status: 500 }
    );
  }
}
