import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getAnalysisSystemPrompt, parseAnalysisResponse } from '@/lib/ai';
import { getCountryContext } from '@/lib/countryData';
import { CountryCode } from '@/lib/types';
import { createServiceClient, validateToken } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rate-limit';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

const anthropic = new Anthropic();

// Extract text from PDF page by page using pdfjs-dist (server-side)
async function extractPdfPageTexts(base64Data: string): Promise<{
  pageTexts: Record<string, string>;
  rawText: string;
  pageCount: number;
}> {
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

    const buffer = Buffer.from(base64Data, 'base64');
    const uint8 = new Uint8Array(buffer);
    const pdf = await pdfjs.getDocument({ data: uint8, useSystemFonts: true }).promise;

    const pageTexts: Record<string, string> = {};
    const allTexts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items
        .map((item: any) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      pageTexts[String(i)] = text;
      allTexts.push(text);
    }

    return {
      pageTexts,
      rawText: allTexts.join('\n\n'),
      pageCount: pdf.numPages,
    };
  } catch (err) {
    console.error('PDF text extraction failed:', err);
    return { pageTexts: {}, rawText: '', pageCount: 0 };
  }
}

export async function POST(request: NextRequest) {
  try {
    // IP-based rate limit — persistent via Supabase RPC (10 uploads/min)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const ipAllowed = await checkRateLimit(`analyze:${ip}`, 10, 60);
    if (!ipAllowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Verify JWT and enforce server-side upload limit
    const authHeader = request.headers.get('authorization');
    const { user: authedUser, error: authError } = await validateToken(authHeader);
    if (authError || !authedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Server-side consent + scan limit check
    const supabaseAdmin = createServiceClient();

    // GDPR: Verify AI consent before processing
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('ai_consent')
      .eq('id', authedUser.id)
      .single();
    if (!profile?.ai_consent) {
      return NextResponse.json({ error: 'AI consent required' }, { status: 403 });
    }

    const { data: canUpload } = await supabaseAdmin.rpc('can_upload', { p_user_id: authedUser.id });
    if (!canUpload) {
      return NextResponse.json(
        { error: 'Upload limit reached. Upgrade your plan for more documents.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { image, language, isPdf, type, textContent, country, status, documentId } = body;
    const userId = authedUser.id; // Always use authenticated user ID, never trust client

    if ((!image && !textContent) || !language) {
      return NextResponse.json({ error: 'Missing data or language' }, { status: 400 });
    }

    const countryContext = country
      ? await getCountryContext(country as CountryCode)
      : undefined;

    const systemPrompt = getAnalysisSystemPrompt(language, countryContext, status);

    // Extract page texts from PDF for citations
    let pageTexts: Record<string, string> = {};
    let rawText = '';
    let pageCount = 0;
    let fileType = 'image';

    let messages: Anthropic.MessageParam[];

    if (type === 'text' && textContent) {
      fileType = 'text';
      rawText = textContent;
      messages = [{
        role: 'user' as const,
        content: `Analyze this document:\n\n${textContent.slice(0, 100000)}`,
      }];
    } else if (isPdf || type === 'pdf') {
      fileType = 'pdf';
      const base64Data = image.replace(/^data:application\/pdf;base64,/, '');

      // Extract page texts for citations
      const extracted = await extractPdfPageTexts(base64Data);
      pageTexts = extracted.pageTexts;
      rawText = extracted.rawText;
      pageCount = extracted.pageCount;

      // If we got text, send as text (cheaper, more reliable)
      // If no text extracted (scanned PDF), use Claude Vision
      if (rawText.length > 200) {
        // Text-based PDF — send extracted text + page info
        const textForAnalysis = rawText.slice(0, 100000);
        messages = [{
          role: 'user' as const,
          content: `Analyze this ${pageCount}-page PDF document:\n\n${textForAnalysis}`,
        }];
      } else {
        // Scanned PDF (image-based) — fallback to native document
        messages = [{
          role: 'user' as const,
          content: [
            { type: 'document' as const, source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: base64Data } },
            { type: 'text' as const, text: 'Analyze this document.' },
          ],
        }];
      }
    } else if (type === 'docx' || image?.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml')) {
      // DOCX — extract text with mammoth
      fileType = 'docx';
      const base64Data = image.replace(/^data:[^;]+;base64,/, '');
      try {
        const mammoth = await import('mammoth');
        const { value: extractedText } = await mammoth.default.extractRawText({ buffer: Buffer.from(base64Data, 'base64') });
        rawText = extractedText;
        messages = [{
          role: 'user' as const,
          content: `Analyze this DOCX document:\n\n${extractedText.slice(0, 100000)}`,
        }];
      } catch (err) {
        console.error('DOCX parsing failed:', err);
        return NextResponse.json({ error: 'Failed to parse DOCX file' }, { status: 400 });
      }
    } else if (type === 'xlsx' || image?.startsWith('data:application/vnd.openxmlformats-officedocument.spreadsheetml') || image?.startsWith('data:application/vnd.ms-excel')) {
      // Excel files not supported (xlsx removed due to CVE)
      return NextResponse.json({ error: 'Excel files are not supported yet. Please convert to PDF or CSV.' }, { status: 400 });
    } else if (type === 'pptx' || image?.startsWith('data:application/vnd.openxmlformats-officedocument.presentationml')) {
      // PPTX — extract text via JSZip (PPTX = ZIP with XML slides)
      fileType = 'pptx';
      const base64Data = image.replace(/^data:[^;]+;base64,/, '');
      try {
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(Buffer.from(base64Data, 'base64'));
        const slideTexts: string[] = [];
        const slideFiles = Object.keys(zip.files).filter(f => f.match(/ppt\/slides\/slide\d+\.xml/)).sort();
        for (const slidePath of slideFiles) {
          const xml = await zip.files[slidePath].async('string');
          // Extract text from <a:t> tags
          const texts = xml.match(/<a:t>([^<]*)<\/a:t>/g)?.map(t => t.replace(/<\/?a:t>/g, '')) || [];
          if (texts.length > 0) {
            slideTexts.push(`--- Slide ${slideTexts.length + 1} ---\n${texts.join(' ')}`);
          }
        }
        rawText = slideTexts.join('\n\n');
        pageCount = slideTexts.length;
        messages = [{
          role: 'user' as const,
          content: `Analyze this PowerPoint presentation (${pageCount} slides):\n\n${rawText.slice(0, 100000)}`,
        }];
      } catch (err) {
        console.error('PPTX parsing failed:', err);
        return NextResponse.json({ error: 'Failed to parse PowerPoint file' }, { status: 400 });
      }
    } else if (image?.startsWith('data:text/csv') || type === 'csv') {
      // CSV
      fileType = 'csv';
      const base64Data = image.replace(/^data:[^;]+;base64,/, '');
      rawText = Buffer.from(base64Data, 'base64').toString('utf-8').replace(/^\uFEFF/, '');
      messages = [{
        role: 'user' as const,
        content: `Analyze this CSV data:\n\n${rawText.slice(0, 100000)}`,
      }];
    } else {
      // Image (JPEG, PNG, HEIC, etc.)
      fileType = 'image';
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

    // Auto-retry on 529 (overloaded)
    let response;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 3000,
          system: systemPrompt,
          messages,
        });
        break;
      } catch (retryErr: any) {
        if (retryErr?.status === 529 && attempt < 3) {
          await new Promise(r => setTimeout(r, 5000 * attempt));
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

    // For scanned PDFs and images: rawText is empty because Vision API was used.
    // Build a fallback rawText from analysis fields so translation feature works.
    if (!rawText && analysis) {
      const parts: string[] = [];
      if (analysis.what_is_this) parts.push(analysis.what_is_this);
      if (analysis.what_it_says) parts.push(analysis.what_it_says);
      if (analysis.summary) parts.push(analysis.summary);
      if (analysis.key_facts?.length) parts.push(analysis.key_facts.join('\n'));
      if (analysis.what_to_do?.length) parts.push(analysis.what_to_do.join('\n'));
      if (parts.length > 0) {
        rawText = parts.join('\n\n');
      }
    }

    // Save to Supabase if userId and documentId provided
    if (userId && documentId) {
      try {
        const supabase = createServiceClient();

        // Upload original file to Storage
        let fileUrl = '';
        if (image) {
          const base64Clean = image.replace(/^data:[^;]+;base64,/, '');
          const mime = image.match(/data:([^;]+)/)?.[1] || 'application/octet-stream';
          const ext = fileType === 'pdf' ? 'pdf' : (mime.split('/')[1] || 'bin');
          const path = `${userId}/${documentId}/original.${ext}`;
          const buffer = Buffer.from(base64Clean, 'base64');

          const { error: uploadErr } = await supabase.storage
            .from('documents')
            .upload(path, buffer, { contentType: mime, upsert: true });

          if (!uploadErr) {
            fileUrl = path;
          }
        }

        // Insert document record
        await supabase.from('documents').upsert({
          id: documentId,
          user_id: userId,
          title: analysis.document_title,
          category: analysis.category,
          doc_type: analysis.doc_type || 'other',
          doc_type_label: analysis.doc_type_label || null,
          status: 'new',
          summary: analysis.summary || null,
          what_is_this: analysis.what_is_this,
          what_it_says: analysis.what_it_says,
          what_to_do: analysis.what_to_do,
          deadline: analysis.deadline || null,
          deadline_description: analysis.deadline_description || null,
          urgency: analysis.urgency,
          urgency_reason: analysis.urgency_reason || null,
          amounts: analysis.amounts || [],
          health_score: analysis.health_score ?? null,
          health_score_explanation: analysis.health_score_explanation || null,
          risk_flags: analysis.risk_flags || [],
          positive_points: analysis.positive_points || [],
          key_facts: analysis.key_facts || [],
          suggested_questions: analysis.suggested_questions || [],
          entities: analysis.entities || null,
          specialist_type: analysis.specialist_type || null,
          specialist_recommendation: analysis.specialist_recommendation || null,
          raw_text: rawText || null,
          page_texts: Object.keys(pageTexts).length > 0 ? pageTexts : null,
          page_count: pageCount || 1,
          file_type: fileType,
          file_url: fileUrl || null,
          image_url: fileUrl || null,
          language: language,
          confidence: analysis.confidence || null,
          document_country: analysis.document_country || null,
          document_language: analysis.document_language || null,
          key_entities: analysis.key_entities || null,
          related_documents: analysis.related_documents || null,
          recommendations: analysis.recommendations || [],
        });
      } catch (dbErr: any) {
        console.error('Supabase save error:', dbErr?.message || dbErr);
        // Don't fail the request — return analysis even if save fails
      }
    }

    // Return analysis + extra data for client
    return NextResponse.json({
      ...analysis,
      _pageTexts: Object.keys(pageTexts).length > 0 ? pageTexts : undefined,
      _rawText: rawText || undefined,
      _pageCount: pageCount || undefined,
      _fileType: fileType,
    });
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
