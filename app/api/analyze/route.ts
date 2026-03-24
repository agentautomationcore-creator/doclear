import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getAnalysisSystemPrompt, parseAnalysisResponse } from '@/lib/ai';

const anthropic = new Anthropic();

// Simple in-memory rate limiter
const rateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimiter.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimiter.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const { image, language, isPdf } = await request.json();

    if (!image || !language) {
      return NextResponse.json(
        { error: 'Missing image or language' },
        { status: 400 }
      );
    }

    // Check file size (~10MB in base64)
    if (image.length > 14_000_000) {
      return NextResponse.json(
        { error: 'File too large (max 10MB)' },
        { status: 400 }
      );
    }

    // Build content block based on file type
    let contentBlock: Anthropic.ImageBlockParam | Anthropic.DocumentBlockParam;

    if (isPdf) {
      const base64Data = image.replace(/^data:application\/pdf;base64,/, '');
      contentBlock = {
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: base64Data,
        },
      };
    } else {
      const base64Data = image.replace(/^data:[^;]+;base64,/, '');
      let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg';
      if (image.startsWith('data:image/png')) mediaType = 'image/png';
      else if (image.startsWith('data:image/webp')) mediaType = 'image/webp';
      else if (image.startsWith('data:image/gif')) mediaType = 'image/gif';

      contentBlock = {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64Data,
        },
      };
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: getAnalysisSystemPrompt(language),
      messages: [
        {
          role: 'user',
          content: [
            contentBlock,
            {
              type: 'text',
              text: 'Analyze this document.',
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    const analysis = parseAnalysisResponse(textBlock.text);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
