import { CountryCode } from './types';

export interface CountryData {
  code: string;
  name: Record<string, string>;
  portals: {
    id: string;
    name: string;
    url: string;
    for: string[];
    description: Record<string, string>;
  }[];
  rules: Record<string, string>;
  document_types: Record<string, {
    category: string;
    professional_needed: string[];
    portal: string | null;
    urgency_rule?: string;
  }>;
}

const cache: Record<string, CountryData> = {};

export async function getCountryData(code: CountryCode): Promise<CountryData | null> {
  if (code === 'OTHER') return null;
  if (cache[code]) return cache[code];

  try {
    const data = await import(`@/data/countries/${code}.json`);
    cache[code] = data.default || data;
    return cache[code];
  } catch {
    return null;
  }
}

export async function getCountryContext(code: CountryCode): Promise<string> {
  const data = await getCountryData(code);
  if (!data) return 'No specific country data available. Give general advice.';
  return JSON.stringify(data, null, 2);
}
