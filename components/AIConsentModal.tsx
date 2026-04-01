'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

const CONSENT_KEY = 'doclear_ai_consent';

export function hasAIConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CONSENT_KEY) === 'true';
}

export function grantAIConsent(): void {
  localStorage.setItem(CONSENT_KEY, 'true');
}

interface AIConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export default function AIConsentModal({ isOpen, onAccept }: AIConsentModalProps) {
  const t = useTranslations('consent');

  if (!isOpen) return null;

  const handleAccept = () => {
    grantAIConsent();
    onAccept();
  };

  const items = [
    { title: t('ai_title'), desc: t('ai_desc') },
    { title: t('training_title'), desc: t('training_desc') },
    { title: t('encrypted_title'), desc: t('encrypted_desc') },
    { title: t('eu_title'), desc: t('eu_desc') },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[#1E293B]/10 flex items-center justify-center mb-3">
              <span className="text-xl font-bold text-[#1E293B]">AI</span>
            </div>
            <h2 className="text-lg font-semibold text-[#0F172A] text-center">
              {t('title')}
            </h2>
          </div>

          {/* Explanation items */}
          <div className="space-y-4 mb-6">
            {items.map((item, i) => (
              <div key={i}>
                <p className="text-sm font-medium text-[#0F172A] mb-1">{item.title}</p>
                <p className="text-sm text-[#64748B] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <button
            onClick={handleAccept}
            className="w-full h-12 bg-[#1E293B] text-white font-medium rounded-xl hover:bg-[#334155] transition-colors"
          >
            {t('agree')}
          </button>
          <a
            href="https://doclear.app/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm text-[#64748B] mt-3 hover:underline"
          >
            {t('learn_more')}
          </a>
        </div>
      </div>
    </div>
  );
}
