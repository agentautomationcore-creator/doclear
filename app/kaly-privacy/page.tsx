'use client';

import { useState } from 'react';

const content = {
  fr: {
    title: 'Politique de Confidentialite — Kaly',
    lastUpdated: 'Derniere mise a jour : 1er avril 2026',
    switchLang: 'English',
    sections: [
      {
        title: 'Responsable du traitement',
        body: `Growthor SAS (SIREN 944 537 034)\nJuan-les-Pins, 06160, France\nContact : contact@kaly.app`,
      },
      {
        title: 'Donnees collectees',
        items: [
          'Adresse email (lors de l\'inscription)',
          'Photos de repas (pour l\'analyse nutritionnelle par IA)',
          'Donnees nutritionnelles : calories, macronutriments, poids, objectifs',
          'Donnees de sante : poids, IMC, objectifs caloriques (Art. 9 RGPD — consentement explicite requis)',
          'Preferences alimentaires (regime, allergies, exclusions)',
          'Journal d\'hydratation',
          'Preferences de langue et de theme',
          'Statistiques d\'utilisation anonymes (uniquement apres consentement)',
        ],
      },
      {
        title: 'Donnees de sante — Consentement explicite (Art. 9 RGPD)',
        body: `Kaly traite des donnees de sante (poids, nutrition, objectifs caloriques). Ces donnees sont des "categories particulieres" au sens de l'Art. 9 du RGPD.\n\nNous demandons votre consentement explicite AVANT toute collecte de donnees de sante, lors de l'onboarding. Ce consentement est enregistre dans notre base de donnees avec un horodatage.\n\nVous pouvez retirer ce consentement a tout moment dans Parametres > Confidentialite. Le retrait du consentement bloque tout traitement futur de vos donnees de sante.`,
      },
      {
        title: 'Ce que nous ne faisons PAS',
        items: [
          'Nous ne vendons PAS vos donnees a des tiers',
          'Nous n\'utilisons PAS vos photos de repas pour entrainer des modeles IA',
          'Nous ne stockons PAS vos coordonnees bancaires (gere par Apple/Google/RevenueCat)',
          'Nous ne partageons PAS vos donnees nutritionnelles avec quiconque',
        ],
      },
      {
        title: 'Services tiers',
        items: [
          'Anthropic (Claude API) — analyse nutritionnelle des photos, pas d\'entrainement sur les donnees',
          'Supabase — base de donnees et stockage, serveurs UE (Francfort, Allemagne)',
          'RevenueCat — gestion des abonnements (DPA signe)',
          'Sentry — rapports d\'erreurs (processeur tiers, DPA signe)',
        ],
      },
      {
        title: 'Utilisation de l\'IA',
        body: `Vos photos de repas sont envoyees a l'API Claude d'Anthropic pour analyse nutritionnelle. Anthropic n'utilise pas les donnees API pour entrainer ses modeles. Les photos sont traitees en temps reel et ne sont pas stockees sur les serveurs d'Anthropic apres traitement.\n\nBase legale : votre consentement explicite (Art. 6(1)(a) et Art. 9(2)(a) RGPD). Vous donnez votre consentement avant la premiere analyse. Vous pouvez le retirer a tout moment dans les Parametres.`,
      },
      {
        title: 'Stockage des donnees',
        body: 'Toutes les donnees sont stockees chiffrees sur les serveurs Supabase situes dans l\'Union Europeenne (Francfort, Allemagne).',
      },
      {
        title: 'Vos droits (RGPD)',
        items: [
          'Acces : consultez toutes vos donnees stockees dans l\'application',
          'Suppression : supprimez toutes vos donnees via Parametres > Supprimer le compte',
          'Export : exportez toutes vos donnees (Art. 20)',
          'Rectification : modifiez vos donnees de profil a tout moment',
          'Opposition : vous avez le droit de vous opposer au traitement de vos donnees (Art. 21)',
          'Retrait du consentement : retirez votre consentement a tout moment dans Parametres > Confidentialite',
        ],
      },
      {
        title: 'Conservation des donnees',
        items: [
          'Donnees nutritionnelles et analyses : conservees tant que votre compte est actif',
          'Apres suppression du compte : toutes les donnees sont definitivement supprimees sous 30 jours',
          'Donnees de paiement : conservees conformement a la loi fiscale (generalement 7 ans)',
        ],
      },
      {
        title: 'Reclamation',
        body: 'Vous pouvez introduire une reclamation aupres de la CNIL (www.cnil.fr) si vous estimez que le traitement de vos donnees n\'est pas conforme au RGPD.',
      },
      {
        title: 'Contact',
        body: 'Pour toute question relative a la confidentialite : contact@kaly.app\n\nKaly est opere par Growthor SAS (SIREN 944 537 034), Juan-les-Pins, France.',
      },
    ],
  },
  en: {
    title: 'Privacy Policy — Kaly',
    lastUpdated: 'Last updated: April 1, 2026',
    switchLang: 'Francais',
    sections: [
      {
        title: 'Data Controller',
        body: `Growthor SAS (SIREN 944 537 034)\nJuan-les-Pins, 06160, France\nContact: contact@kaly.app`,
      },
      {
        title: 'What data we collect',
        items: [
          'Email address (when you sign up)',
          'Meal photos (for AI nutritional analysis)',
          'Nutritional data: calories, macronutrients, weight, goals',
          'Health data: weight, BMI, caloric goals (Art. 9 GDPR — explicit consent required)',
          'Dietary preferences (diet type, allergies, exclusions)',
          'Hydration log',
          'Language and theme preferences',
          'Anonymous usage analytics (only after consent)',
        ],
      },
      {
        title: 'Health Data — Explicit Consent (Art. 9 GDPR)',
        body: `Kaly processes health data (weight, nutrition, caloric goals). These are "special categories" under Art. 9 GDPR.\n\nWe request your explicit consent BEFORE any health data collection, during onboarding. This consent is recorded in our database with a timestamp.\n\nYou can withdraw consent at any time in Settings > Privacy. Withdrawing consent blocks all future processing of your health data.`,
      },
      {
        title: 'What we do NOT do',
        items: [
          'We do NOT sell your data to third parties',
          'We do NOT use your meal photos to train AI models',
          'We do NOT store payment card details (handled by Apple/Google/RevenueCat)',
          'We do NOT share your nutritional data with anyone',
        ],
      },
      {
        title: 'Third-party services',
        items: [
          'Anthropic (Claude API) — nutritional analysis of photos, no model training on inputs',
          'Supabase — database and storage, EU servers (Frankfurt, Germany)',
          'RevenueCat — subscription management (DPA signed)',
          'Sentry — error reporting (third-party processor, DPA signed)',
        ],
      },
      {
        title: 'How we use AI',
        body: `Your meal photos are sent to Anthropic's Claude API for nutritional analysis. Anthropic does not use API inputs to train models. Photos are processed in real-time and not stored on Anthropic's servers after processing.\n\nLegal basis: your explicit consent (Art. 6(1)(a) and Art. 9(2)(a) GDPR). You provide consent before your first analysis. You can withdraw consent at any time in Settings.`,
      },
      {
        title: 'Data storage',
        body: 'All data is stored encrypted on Supabase servers located in the European Union (Frankfurt, Germany).',
      },
      {
        title: 'Your rights (GDPR)',
        items: [
          'Access: view all your stored data in the app',
          'Deletion: delete all your data via Settings > Delete Account',
          'Export: export all your data (Art. 20)',
          'Rectification: edit or correct your profile data at any time',
          'Right to object: you have the right to object to data processing (Art. 21)',
          'Withdraw consent: withdraw your consent at any time in Settings > Privacy',
        ],
      },
      {
        title: 'Data Retention',
        items: [
          'Nutritional data and analyses: retained while your account is active',
          'After account deletion: all data permanently deleted within 30 days',
          'Payment records: retained as required by tax law (typically 7 years)',
        ],
      },
      {
        title: 'Complaints',
        body: 'You may file a complaint with the CNIL (www.cnil.fr) if you believe your data processing is not GDPR-compliant.',
      },
      {
        title: 'Contact',
        body: 'For privacy inquiries: contact@kaly.app\n\nKaly is operated by Growthor SAS (SIREN 944 537 034), Juan-les-Pins, France.',
      },
    ],
  },
};

export default function KalyPrivacyPage() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const c = content[lang];

  return (
    <html lang={lang}>
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ minHeight: '100vh', background: '#fff' }}>
          <header style={{
            position: 'sticky', top: 0, zIndex: 50,
            background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
            borderBottom: '1px solid #D2D2D7', padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            maxWidth: 720, margin: '0 auto',
          }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#34C759' }}>Kaly</span>
            <button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              style={{
                background: 'none', border: '1px solid #D2D2D7', borderRadius: 8,
                padding: '6px 14px', cursor: 'pointer', fontSize: 14, color: '#1D1D1F',
              }}
            >
              {c.switchLang}
            </button>
          </header>

          <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1D1D1F', marginBottom: 8 }}>{c.title}</h1>
            <p style={{ color: '#86868B', fontSize: 14, marginBottom: 32 }}>{c.lastUpdated}</p>

            {c.sections.map((section, i) => (
              <section key={i} style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1D1D1F', marginBottom: 8 }}>{section.title}</h2>
                {section.body && (
                  <p style={{ color: '#86868B', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{section.body}</p>
                )}
                {section.items && (
                  <ul style={{ color: '#86868B', lineHeight: 1.7, paddingLeft: 20 }}>
                    {section.items.map((item, j) => (
                      <li key={j} style={{ marginBottom: 4 }}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </body>
    </html>
  );
}
