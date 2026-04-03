'use client';

import { useState } from 'react';

type Section = {
  title: string;
  body?: string;
  items?: string[];
};

type LangContent = {
  title: string;
  lastUpdated: string;
  switchLang: string;
  sections: Section[];
};

const content: Record<'fr' | 'en', LangContent> = {
  fr: {
    title: 'Politique de Confidentialité — Kaly',
    lastUpdated: 'Dernière mise à jour : 3 avril 2026',
    switchLang: 'English',
    sections: [
      {
        title: 'Responsable du traitement',
        body: `Dmitrii Sergueev, exerçant sous le nom commercial « Growthor », Entrepreneur individuel — SIREN 944 537 034\nJuan-les-Pins, 06160, France\nContact : contact@kaly.app`,
      },
      {
        title: 'Données collectées',
        items: [
          'Adresse email (lors de l\'inscription)',
          'Photos de repas (pour l\'analyse nutritionnelle par IA — les métadonnées EXIF, y compris la géolocalisation, sont supprimées avant tout envoi)',
          'Données nutritionnelles : calories, macronutriments (protéines, glucides, lipides, fibres)',
          'Données de santé : poids, taille, âge, sexe, niveau d\'activité, objectifs caloriques, IMC (Art. 9 RGPD — consentement explicite requis)',
          'Préférences alimentaires (régime, allergies, exclusions)',
          'Journal d\'hydratation (verres d\'eau)',
          'Préférences de langue, thème, et unités (métrique/impérial)',
          'Statistiques d\'utilisation anonymes (uniquement après consentement opt-in)',
        ],
      },
      {
        title: 'Données de santé — Consentement explicite (Art. 9 RGPD)',
        body: `Kaly traite des données de santé (poids, taille, âge, nutrition, objectifs caloriques). Ces données sont des « catégories particulières » au sens de l'Art. 9 du RGPD.\n\nNous demandons votre consentement explicite AVANT toute collecte de données de santé, lors de l'onboarding. Ce consentement est enregistré côté serveur (Supabase) avec un horodatage.\n\nVous pouvez retirer ce consentement à tout moment dans Paramètres > Confidentialité. Le retrait du consentement bloque tout traitement futur de vos données de santé.`,
      },
      {
        title: 'Ce que nous ne faisons PAS',
        items: [
          'Nous ne vendons PAS vos données à des tiers',
          'Nous n\'utilisons PAS vos photos de repas pour entraîner des modèles IA',
          'Nous ne stockons PAS vos photos après analyse — elles sont traitées en temps réel puis supprimées',
          'Nous ne stockons PAS vos coordonnées bancaires (géré par Apple via RevenueCat)',
          'Nous ne partageons PAS vos données nutritionnelles avec quiconque',
          'Nous ne collectons PAS de données de géolocalisation (EXIF supprimé avant envoi)',
        ],
      },
      {
        title: 'Services tiers (sous-traitants)',
        items: [
          'Anthropic (Claude Haiku API) — analyse nutritionnelle des photos. Anthropic n\'utilise pas les données API pour entraîner ses modèles. Les photos ne sont pas stockées après traitement.',
          'Supabase — base de données et authentification, serveurs UE (Francfort, Allemagne). DPA signé.',
          'RevenueCat — gestion des abonnements in-app. DPA signé. Aucune donnée de carte bancaire ne transite par nos serveurs.',
          'PostHog — analytique d\'utilisation anonyme. Initialisé UNIQUEMENT après consentement opt-in de l\'utilisateur. Aucune donnée de santé n\'est envoyée à PostHog.',
          'Sentry — rapports d\'erreurs. Initialisé UNIQUEMENT après consentement opt-in. Aucune donnée personnelle de santé dans les rapports d\'erreur. DPA signé.',
        ],
      },
      {
        title: 'Utilisation de l\'IA',
        body: `Vos photos de repas sont envoyées à l'API Claude d'Anthropic pour analyse nutritionnelle.\n\nAvant envoi :\n• Les métadonnées EXIF (GPS, appareil photo) sont supprimées\n• L'image est compressée (max 1024px, JPEG)\n\nAnthopic n'utilise pas les données API pour entraîner ses modèles. Les photos sont traitées en temps réel et ne sont pas stockées sur les serveurs d'Anthropic après traitement.\n\nBase légale : votre consentement explicite (Art. 6(1)(a) et Art. 9(2)(a) RGPD). Vous donnez votre consentement avant la première analyse. Vous pouvez le retirer à tout moment dans les Paramètres > Confidentialité.`,
      },
      {
        title: 'Stockage des données',
        body: 'Toutes les données sont stockées chiffrées sur les serveurs Supabase situés dans l\'Union Européenne (Francfort, Allemagne). Les données de consentement sont stockées côté serveur avec horodatage pour conformité RGPD.',
      },
      {
        title: 'Vos droits (RGPD)',
        items: [
          'Accès (Art. 15) : consultez toutes vos données stockées dans l\'application',
          'Suppression (Art. 17) : supprimez toutes vos données via Paramètres > Supprimer le compte (suppression CASCADE)',
          'Portabilité (Art. 20) : exportez toutes vos données au format CSV',
          'Rectification (Art. 16) : modifiez vos données de profil à tout moment',
          'Opposition (Art. 21) : vous avez le droit de vous opposer au traitement de vos données',
          'Retrait du consentement (Art. 7) : retirez votre consentement à tout moment dans Paramètres > Confidentialité',
        ],
      },
      {
        title: 'Conservation des données',
        items: [
          'Données nutritionnelles et analyses : conservées tant que votre compte est actif',
          'Après suppression du compte : toutes les données sont définitivement supprimées sous 30 jours',
          'Données de paiement : conservées conformément à la loi fiscale (généralement 7 ans) — gérées par Apple/RevenueCat',
        ],
      },
      {
        title: 'Réclamation',
        body: 'Vous pouvez introduire une réclamation auprès de la CNIL (https://www.cnil.fr/fr/plaintes) si vous estimez que le traitement de vos données n\'est pas conforme au RGPD.',
      },
      {
        title: 'Contact',
        body: 'Pour toute question relative à la confidentialité : contact@kaly.app\n\nKaly est opéré par Dmitrii Sergueev, exerçant sous le nom commercial « Growthor », Entrepreneur individuel — SIREN 944 537 034, Juan-les-Pins, France.',
      },
    ],
  },
  en: {
    title: 'Privacy Policy — Kaly',
    lastUpdated: 'Last updated: April 3, 2026',
    switchLang: 'Français',
    sections: [
      {
        title: 'Data Controller',
        body: `Dmitrii Sergueev, trading as "Growthor", Sole Proprietor (Entrepreneur individuel) — SIREN 944 537 034\nJuan-les-Pins, 06160, France\nContact: contact@kaly.app`,
      },
      {
        title: 'What data we collect',
        items: [
          'Email address (when you sign up)',
          'Meal photos (for AI nutritional analysis — EXIF metadata including GPS is stripped before sending)',
          'Nutritional data: calories, macronutrients (protein, carbs, fat, fiber)',
          'Health data: weight, height, age, gender, activity level, caloric goals, BMI (Art. 9 GDPR — explicit consent required)',
          'Dietary preferences (diet type, allergies, exclusions)',
          'Hydration log (glasses of water)',
          'Language, theme, and unit preferences (metric/imperial)',
          'Anonymous usage analytics (only after opt-in consent)',
        ],
      },
      {
        title: 'Health Data — Explicit Consent (Art. 9 GDPR)',
        body: `Kaly processes health data (weight, height, age, nutrition, caloric goals). These are "special categories" under Art. 9 GDPR.\n\nWe request your explicit consent BEFORE any health data collection, during onboarding. This consent is recorded server-side (Supabase) with a timestamp.\n\nYou can withdraw consent at any time in Settings > Privacy. Withdrawing consent blocks all future processing of your health data.`,
      },
      {
        title: 'What we do NOT do',
        items: [
          'We do NOT sell your data to third parties',
          'We do NOT use your meal photos to train AI models',
          'We do NOT store your photos after analysis — they are processed in real-time then deleted',
          'We do NOT store payment card details (handled by Apple via RevenueCat)',
          'We do NOT share your nutritional data with anyone',
          'We do NOT collect geolocation data (EXIF stripped before sending)',
        ],
      },
      {
        title: 'Third-party services (sub-processors)',
        items: [
          'Anthropic (Claude Haiku API) — nutritional analysis of meal photos. Anthropic does not use API inputs to train models. Photos are not stored after processing.',
          'Supabase — database and authentication, EU servers (Frankfurt, Germany). DPA signed.',
          'RevenueCat — in-app subscription management. DPA signed. No payment card data passes through our servers.',
          'PostHog — anonymous usage analytics. Initialized ONLY after user opt-in consent. No health data is sent to PostHog.',
          'Sentry — error reporting. Initialized ONLY after user opt-in consent. No personal health data in error reports. DPA signed.',
        ],
      },
      {
        title: 'How we use AI',
        body: `Your meal photos are sent to Anthropic's Claude API for nutritional analysis.\n\nBefore sending:\n• EXIF metadata (GPS, camera info) is stripped\n• Image is compressed (max 1024px, JPEG)\n\nAnthropic does not use API inputs to train models. Photos are processed in real-time and not stored on Anthropic's servers after processing.\n\nLegal basis: your explicit consent (Art. 6(1)(a) and Art. 9(2)(a) GDPR). You provide consent before your first analysis. You can withdraw consent at any time in Settings > Privacy.`,
      },
      {
        title: 'Data storage',
        body: 'All data is stored encrypted on Supabase servers located in the European Union (Frankfurt, Germany). Consent records are stored server-side with timestamps for GDPR compliance.',
      },
      {
        title: 'Your rights (GDPR)',
        items: [
          'Access (Art. 15): view all your stored data in the app',
          'Deletion (Art. 17): delete all your data via Settings > Delete Account (CASCADE deletion)',
          'Portability (Art. 20): export all your data as CSV',
          'Rectification (Art. 16): edit or correct your profile data at any time',
          'Right to object (Art. 21): you have the right to object to data processing',
          'Withdraw consent (Art. 7): withdraw your consent at any time in Settings > Privacy',
        ],
      },
      {
        title: 'Data retention',
        items: [
          'Nutritional data and analyses: retained while your account is active',
          'After account deletion: all data permanently deleted within 30 days',
          'Payment records: retained as required by tax law (typically 7 years) — managed by Apple/RevenueCat',
        ],
      },
      {
        title: 'Complaints',
        body: 'You may file a complaint with the CNIL (https://www.cnil.fr/fr/plaintes) if you believe your data processing is not GDPR-compliant.',
      },
      {
        title: 'Contact',
        body: 'For privacy inquiries: contact@kaly.app\n\nKaly is operated by Dmitrii Sergueev, trading as "Growthor", Sole Proprietor (Entrepreneur individuel) — SIREN 944 537 034, Juan-les-Pins, France.',
      },
    ],
  },
};

export default function KalyPrivacyPage() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const c = content[lang];

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
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
  );
}
