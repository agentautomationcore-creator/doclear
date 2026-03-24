import { Document } from './types';

export function generateShareText(doc: Document, analyzedWith: string): string {
  const lines: string[] = [];

  lines.push(`\ud83d\udcc4 ${doc.title}`);
  lines.push('');
  lines.push(`\ud83c\udff7\ufe0f ${doc.whatIsThis}`);
  lines.push('');
  lines.push(`\ud83d\udccb ${doc.whatItSays}`);
  lines.push('');

  if (doc.whatToDo.length > 0) {
    lines.push('\u2705');
    doc.whatToDo.forEach((step, i) => {
      lines.push(`${i + 1}. ${step}`);
    });
    lines.push('');
  }

  if (doc.deadlineDescription) {
    lines.push(`\u23f0 ${doc.deadlineDescription}`);
    lines.push('');
  }

  lines.push(`\u2014 ${analyzedWith} (doclear.app)`);

  return lines.join('\n');
}

export async function shareDocument(
  doc: Document,
  analyzedWith: string
): Promise<void> {
  const text = generateShareText(doc, analyzedWith);

  if (navigator.share) {
    await navigator.share({
      title: doc.title,
      text,
      url: 'https://doclear.app',
    });
  } else {
    await navigator.clipboard.writeText(text);
  }
}
