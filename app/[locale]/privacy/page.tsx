'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function PrivacyPage() {
  const app = useTranslations('app');

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#D2D2D7]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">{app('name')}</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#1D1D1F] mb-6">Privacy Policy</h1>
        <p className="text-[#86868B] text-sm mb-8">Last updated: March 24, 2026</p>

        <div className="space-y-6 text-[#86868B] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">What data we collect</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Email address (when you sign up with Google)</li>
              <li>Photos of documents (stored encrypted on EU servers via Supabase)</li>
              <li>Country and language preferences (for personalization)</li>
              <li>Anonymous usage analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">What we do NOT do</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>We do NOT sell your data to third parties</li>
              <li>We do NOT use your document photos to train AI models</li>
              <li>We do NOT store payment card details (handled by Stripe/Apple/Google)</li>
              <li>We do NOT share your documents with anyone</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">How we use AI</h2>
            <p>Your documents are sent to Anthropic&apos;s Claude API for analysis. Anthropic does not use API inputs to train models. Documents are processed in real-time and not stored on Anthropic&apos;s servers after processing.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">Data storage</h2>
            <p>In the free version, all data is stored locally on your device (localStorage). No data leaves your device except when you scan a document (sent to our API for AI analysis).</p>
            <p className="mt-2">In the Pro version with cloud sync, data is stored encrypted on Supabase servers located in the European Union (Frankfurt, Germany).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">Your rights (GDPR)</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Access:</strong> You can view all your stored data in the app</li>
              <li><strong>Deletion:</strong> Delete all your data via Settings &gt; Delete Account</li>
              <li><strong>Export:</strong> Export all your documents and data</li>
              <li><strong>Portability:</strong> Download your data in a standard format</li>
              <li><strong>Rectification:</strong> Edit or correct your profile data at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">Cookies</h2>
            <p>We use only essential cookies for functionality (language preference, session). No tracking cookies, no advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">Contact</h2>
            <p>For privacy inquiries: <a href="mailto:hello@growthor.ai" className="text-primary hover:underline">hello@growthor.ai</a></p>
            <p className="mt-1">DocLear is operated by Growthor.ai, Juan-les-Pins, France.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
