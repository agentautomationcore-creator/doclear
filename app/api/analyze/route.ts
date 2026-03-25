import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getAnalysisSystemPrompt, parseAnalysisResponse } from '@/lib/ai';
import { getCountryContext } from '@/lib/countryData';
import { CountryCode } from '@/lib/types';

// Allow larger request bodies (PDFs can be big)
export const maxDuration = 120; // seconds — large PDFs need more time
export const dynamic = 'force-dynamic';

const anthropic = new Anthropic();

const rateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000;

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
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const { image, language, isPdf, type, textContent, country, status } = body;

    if ((!image && !textContent) || !language) {
      return NextResponse.json({ error: 'Missing data or language' }, { status: 400 });
    }

    // Get country context
    const countryContext = country
      ? await getCountryContext(country as CountryCode)
      : undefined;

    const systemPrompt = getAnalysisSystemPrompt(language, countryContext, status);

    let messages: Anthropic.MessageParam[];

    if (type === 'text' && textContent) {
      // Text documents (DOCX, XLSX, TXT, etc.)
      messages = [{
        role: 'user' as const,
        content: `Analyze this document:\n\n${textContent.slice(0, 15000)}`,
      }];
    } else if (isPdf || type === 'pdf') {
      // PDF
      const base64Data = image.replace(/^data:application\/pdf;base64,/, '');
      messages = [{
        role: 'user' as const,
        content: [
          { type: 'document' as const, source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: base64Data } },
          { type: 'text' as const, text: 'Analyze this document.' },
        ],
      }];
    } else {
      // Image
      if (image && image.length > 20_000_000) {
        return NextResponse.json({ error: 'File too large (max 15MB)' }, { status: 400 });
      }
      const base64Data = image.replace(/^data:[^;]+;base64,/, '');
      let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg';
      if (image.startsWith('data:image/png')) mediaType = 'image/png';
      else if (image.startsWith('data:image/webp')) mediaType = 'image/webp';
      else if (image.startsWith('data:image/gif')) mediaType = 'image/gif';

      messages = [{
        role: 'user' as const,
        content: [
          { type: 'image' as const, source: { type: 'base64' as const, media_type: mediaType, data: base64Data } },
          { type: 'text' as const, text: 'Analyze this document.' },
        ],
      }];
    }

    // Auto-retry on 529 (overloaded) — up to 3 attempts
    let response;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          system: systemPrompt,
          messages,
        });
        break; // success
      } catch (retryErr: any) {
        if (retryErr?.status === 529 && attempt < 3) {
          await new Promise(r => setTimeout(r, 5000 * attempt)); // 5s, 10s
          continue;
        }
        throw retryErr;
      }
    }
    if (!response) {
      return NextResponse.json({ error: 'AI service temporarily unavailable' }, { status: 503 });
    }

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    const analysis = parseAnalysisResponse(textBlock.text);
    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Analysis error:', error?.message || error, error?.status);
    const errMsg = error?.message || '';
    const msg = error?.status === 413 || errMsg.includes('too large')
      ? 'File too large. Try uploading only the key pages (max 100 pages).'
      : errMsg.includes('timeout') || errMsg.includes('ETIMEDOUT') || errMsg.includes('529')
      ? 'Analysis timed out. The document may be too long. Try uploading fewer pages.'
      : errMsg.includes('credit') || errMsg.includes('balance')
      ? 'Service temporarily unavailable. Please try again later.'
      : 'Analysis failed. Please try again.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
