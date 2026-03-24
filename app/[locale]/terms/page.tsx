'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function TermsPage() {
  const app = useTranslations('app');

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#D2D2D7]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">{app('name')}</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#1D1D1F] mb-6">Terms of Service</h1>
        <p className="text-[#86868B] text-sm mb-8">Last updated: March 24, 2026</p>

        <div className="space-y-6 text-[#86868B] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">1. Service description</h2>
            <p>DocLear is a document analysis service that uses artificial intelligence to help users understand official documents in foreign languages. The service provides document explanations, deadline tracking, and organization features.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">2. Important disclaimer</h2>
            <p><strong>AI analysis is informational only and does NOT constitute legal, financial, medical, or professional advice.</strong> Always consult qualified professionals for important decisions. We do not guarantee 100% accuracy of AI analysis.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">3. User responsibility</h2>
            <p>You are solely responsible for any actions taken based on the AI analysis. DocLear provides tools to help you understand documents, but the interpretation and decision-making remains yours.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">4. Free plan</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>5 free document scans (including chat questions)</li>
              <li>All features available</li>
              <li>Data stored locally on your device</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">5. Pro subscription</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Price: &euro;4.99/month or &euro;29.99/year</li>
              <li>Automatic renewal unless cancelled</li>
              <li>Cancel anytime — Pro features remain active until the end of the billing period</li>
              <li>Refund: within 14 days if no Pro features were used</li>
              <li>All documents are preserved after cancellation (not deleted)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">6. Acceptable use</h2>
            <p>Do not use DocLear to process illegal documents, facilitate fraud, or for any unlawful purpose. We reserve the right to terminate accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">7. Service availability</h2>
            <p>The service is provided &ldquo;as is&rdquo;. We strive for high availability but do not guarantee uninterrupted service. AI analysis requires an internet connection.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">8. Changes to terms</h2>
            <p>We may update these terms. Continued use after changes constitutes acceptance. We will notify users of significant changes via email or in-app notification.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">9. Contact</h2>
            <p>Questions about these terms: <a href="mailto:hello@growthor.ai" className="text-primary hover:underline">hello@growthor.ai</a></p>
            <p className="mt-1">DocLear is operated by Growthor.ai, Juan-les-Pins, France.</p>
            <p className="mt-1">Governing law: French law. Jurisdiction: Nice, France.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
