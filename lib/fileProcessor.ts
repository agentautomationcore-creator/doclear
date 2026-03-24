import { compressImage } from './image';

export interface ProcessedFile {
  type: 'image' | 'pdf' | 'text';
  data: string;
  mediaType: string;
  fileName: string;
  originalFormat: string;
}

export async function processFile(file: File): Promise<ProcessedFile> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const fileName = file.name;

  // Images
  if (['jpg', 'jpeg', 'png', 'heic', 'webp', 'gif'].includes(ext) || file.type.startsWith('image/')) {
    const compressed = await compressImage(file);
    return { type: 'image', data: compressed, mediaType: file.type || 'image/jpeg', fileName, originalFormat: ext };
  }

  // PDF
  if (ext === 'pdf' || file.type === 'application/pdf') {
    const dataUrl = await readAsDataURL(file);
    return { type: 'pdf', data: dataUrl, mediaType: 'application/pdf', fileName, originalFormat: 'pdf' };
  }

  // DOCX
  if (['docx', 'doc'].includes(ext)) {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return { type: 'text', data: result.value, mediaType: 'text/plain', fileName, originalFormat: ext };
  }

  // XLSX/XLS
  if (['xlsx', 'xls'].includes(ext)) {
    const XLSX = await import('xlsx');
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const sheets = workbook.SheetNames.map((name) => {
      const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[name]);
      return `--- ${name} ---\n${csv}`;
    });
    return { type: 'text', data: sheets.join('\n\n'), mediaType: 'text/plain', fileName, originalFormat: ext };
  }

  // Plain text / RTF / EML
  if (['txt', 'rtf', 'eml', 'msg', 'csv'].includes(ext)) {
    const text = await readAsText(file);
    return { type: 'text', data: text, mediaType: 'text/plain', fileName, originalFormat: ext };
  }

  throw new Error('unsupported_format');
}

export async function processZip(file: File): Promise<ProcessedFile[]> {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(file);

  const entries = Object.entries(zip.files).filter(([, f]) => !f.dir);

  if (entries.length > 20) throw new Error('zip_too_many');

  const results: ProcessedFile[] = [];

  for (const [name, zipEntry] of entries) {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    // Skip system files
    if (name.startsWith('__MACOSX') || name.startsWith('.')) continue;

    try {
      if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
        const blob = await zipEntry.async('blob');
        const f = new File([blob], name, { type: `image/${ext === 'jpg' ? 'jpeg' : ext}` });
        results.push(await processFile(f));
      } else if (ext === 'pdf') {
        const base64 = await zipEntry.async('base64');
        results.push({ type: 'pdf', data: `data:application/pdf;base64,${base64}`, mediaType: 'application/pdf', fileName: name, originalFormat: 'pdf' });
      } else if (['docx', 'doc'].includes(ext)) {
        const blob = await zipEntry.async('blob');
        const f = new File([blob], name);
        results.push(await processFile(f));
      } else if (['xlsx', 'xls'].includes(ext)) {
        const blob = await zipEntry.async('blob');
        const f = new File([blob], name);
        results.push(await processFile(f));
      } else if (['txt', 'rtf', 'eml', 'csv'].includes(ext)) {
        const text = await zipEntry.async('string');
        results.push({ type: 'text', data: text, mediaType: 'text/plain', fileName: name, originalFormat: ext });
      }
    } catch {
      // Skip files that can't be processed
    }
  }

  return results;
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

const FORMAT_ICONS: Record<string, string> = {
  pdf: '\ud83d\udcc4',
  docx: '\ud83d\udcdd', doc: '\ud83d\udcdd',
  xlsx: '\ud83d\udcca', xls: '\ud83d\udcca',
  txt: '\ud83d\udcc3', rtf: '\ud83d\udcc3',
  eml: '\u2709\ufe0f', msg: '\u2709\ufe0f',
  zip: '\ud83d\udce6',
  csv: '\ud83d\udcca',
};

export function getFormatIcon(ext: string): string {
  return FORMAT_ICONS[ext.toLowerCase()] || '\ud83d\udcc4';
}
