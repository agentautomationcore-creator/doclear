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
    lastUpdated: 'Dernière mise à jour : 4 avril 2026',
    switchLang: 'English',
    sections: [
      {
        title: 'Responsable du traitement',
        body: `Dmitrii Sergueev, exerçant sous le nom commercial « Growthor »\nEntrepreneur individuel — SIREN 944 537 034\nSIRET : 94453703400018\n117 Boulevard Président Wilson, 06600 Antibes, France\nContact : contact@growthor.ai`,
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
        title: 'Données Apple Santé (HealthKit)',
        body: `Kaly peut se connecter à Apple Santé (HealthKit) pour synchroniser certaines données de santé et d'activité : calories consommées, consommation d'eau, poids et nombre de pas.\n\nBase légale : Consentement explicite — Art. 6(1)(a) + Art. 9(2)(a) RGPD.\n\nStockage : Les données Apple Santé restent sur votre appareil. Kaly lit ces données localement mais ne les transmet pas à des serveurs externes.\n\nRévocation : Réglages iOS > Confidentialité > Santé.`,
      },
      {
        title: 'Bases légales par finalité',
        items: [
          'Analyse nutritionnelle par IA : Consentement explicite — Art. 6(1)(a) + Art. 9(2)(a) RGPD',
          'Suivi de santé et objectifs nutritionnels : Consentement explicite — Art. 6(1)(a) + Art. 9(2)(a) RGPD',
          'Gestion du compte et authentification : Exécution du contrat — Art. 6(1)(b) RGPD',
          'Gestion des abonnements (RevenueCat) : Exécution du contrat — Art. 6(1)(b) RGPD',
          'Analyses d\'utilisation (PostHog) : Consentement — Art. 6(1)(a) RGPD',
          'Rapports d\'erreurs (Sentry) : Consentement — Art. 6(1)(a) RGPD',
        ],
      },
      {
        title: 'Caractère obligatoire ou facultatif des données',
        body: `La fourniture de votre adresse e-mail est nécessaire à la création de votre compte. La fourniture de photos de repas et de données de santé (poids, taille, objectifs nutritionnels) est facultative mais nécessaire au fonctionnement des fonctionnalités d'analyse IA et de suivi nutritionnel. Le refus de fournir ces données n'empêche pas l'utilisation de l'application mais limite les fonctionnalités disponibles (saisie manuelle uniquement).`,
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
          'Anthropic (Claude Haiku API) — États-Unis — analyse nutritionnelle des photos. Anthropic n\'utilise pas les données API pour entraîner ses modèles. Les photos ne sont pas stockées après traitement.',
          'Supabase — Allemagne (UE) — base de données et authentification, serveurs UE (Francfort, Allemagne). DPA signé.',
          'RevenueCat — États-Unis — gestion des abonnements in-app. DPA signé. Aucune donnée de carte bancaire ne transite par nos serveurs.',
          'PostHog — Hébergement UE, société États-Unis — analytique d\'utilisation anonyme. Initialisé UNIQUEMENT après consentement opt-in de l\'utilisateur. Aucune donnée de santé n\'est envoyée à PostHog.',
          'Sentry — États-Unis — rapports d\'erreurs. Initialisé UNIQUEMENT après consentement opt-in. Aucune donnée personnelle de santé dans les rapports d\'erreur. DPA signé.',
        ],
      },
      {
        title: 'Transferts internationaux',
        body: `Les données transmises à Anthropic (États-Unis), RevenueCat (États-Unis), PostHog (hébergement UE, société américaine) et Sentry (États-Unis) sont encadrées par des Clauses Contractuelles Types (CCT) approuvées par la Commission européenne (décision d'exécution 2021/914), garantissant un niveau de protection adéquat conformément aux articles 44 à 49 du RGPD.`,
      },
      {
        title: 'Utilisation de l\'IA',
        body: `Vos photos de repas sont envoyées à l'API Claude d'Anthropic pour analyse nutritionnelle.\n\nAvant envoi :\n• Les métadonnées EXIF (GPS, appareil photo) sont supprimées\n• L'image est compressée (max 1024px, JPEG)\n\nAnthopic n'utilise pas les données API pour entraîner ses modèles. Les photos sont traitées en temps réel et ne sont pas stockées sur les serveurs d'Anthropic après traitement.\n\nBase légale : votre consentement explicite (Art. 6(1)(a) et Art. 9(2)(a) RGPD). Vous donnez votre consentement avant la première analyse. Vous pouvez le retirer à tout moment dans les Paramètres > Confidentialité.`,
      },
      {
        title: 'Décisions automatisées (Article 22 RGPD)',
        body: `Kaly utilise l'intelligence artificielle (Claude AI, Anthropic) pour analyser automatiquement vos photos de repas et estimer le contenu nutritionnel (calories, macronutriments). Ces résultats sont des estimations automatisées fournies à titre indicatif uniquement. Aucune décision n'est prise sans votre intervention : vous pouvez modifier, corriger ou supprimer toute estimation. Vous avez le droit de demander une intervention humaine, d'exprimer votre point de vue et de contester les résultats via contact@growthor.ai.`,
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
          'Limitation du traitement (Art. 18) : vous pouvez demander la limitation du traitement de vos données dans les cas prévus par le RGPD, notamment lorsque vous contestez l\'exactitude de vos données ou que vous vous opposez à leur traitement',
          'Portabilité (Art. 20) : exportez toutes vos données au format CSV',
          'Rectification (Art. 16) : modifiez vos données de profil à tout moment',
          'Opposition (Art. 21) : vous avez le droit de vous opposer au traitement de vos données',
          'Retrait du consentement (Art. 7) : retirez votre consentement à tout moment dans Paramètres > Confidentialité',
        ],
      },
      {
        title: 'Durées de conservation',
        items: [
          'Données nutritionnelles (repas, calories) : durée du compte actif',
          'Données de santé (poids, taille, IMC) : durée du compte actif',
          'Photos de repas : non conservées (supprimées immédiatement après analyse IA)',
          'Données d\'analyse (PostHog) : 12 mois',
          'Données d\'erreur (Sentry) : 90 jours',
          'Données de paiement : 7 ans (obligation fiscale française)',
          'Après suppression du compte : suppression définitive sous 30 jours',
        ],
      },
      {
        title: 'Réclamation',
        body: 'Vous pouvez introduire une réclamation auprès de la CNIL (https://www.cnil.fr/fr/plaintes) si vous estimez que le traitement de vos données n\'est pas conforme au RGPD.',
      },
      {
        title: 'Contact',
        body: 'Pour toute question relative à la confidentialité : contact@growthor.ai\n\nKaly est opéré par Dmitrii Sergueev, exerçant sous le nom commercial « Growthor », Entrepreneur individuel — SIREN 944 537 034, SIRET 94453703400018, 117 Boulevard Président Wilson, 06600 Antibes, France.',
      },
    ],
  },
  en: {
    title: 'Privacy Policy — Kaly',
    lastUpdated: 'Last updated: April 4, 2026',
    switchLang: 'Français',
    sections: [
      {
        title: 'Data Controller',
        body: `Dmitrii Sergueev, trading as "Growthor"\nSole proprietor (Entrepreneur individuel) — SIREN 944 537 034\nSIRET: 94453703400018\n117 Boulevard Président Wilson, 06600 Antibes, France\nContact: contact@growthor.ai`,
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
        title: 'Apple Health Data (HealthKit)',
        body: `Kaly may connect to Apple Health (HealthKit) to synchronize certain health and activity data: calories consumed, water intake, weight, and step count.\n\nLegal basis: Explicit consent — Art. 6(1)(a) + Art. 9(2)(a) GDPR.\n\nStorage: Apple Health data remains on your device. Kaly reads this data locally but does not transmit it to external servers.\n\nWithdrawal: iOS Settings > Privacy > Health.`,
      },
      {
        title: 'Legal bases per purpose',
        items: [
          'AI nutritional analysis: Explicit consent — Art. 6(1)(a) + Art. 9(2)(a) GDPR',
          'Health tracking and nutritional goals: Explicit consent — Art. 6(1)(a) + Art. 9(2)(a) GDPR',
          'Account management and authentication: Performance of contract — Art. 6(1)(b) GDPR',
          'Subscription management (RevenueCat): Performance of contract — Art. 6(1)(b) GDPR',
          'Usage analytics (PostHog): Consent — Art. 6(1)(a) GDPR',
          'Error reporting (Sentry): Consent — Art. 6(1)(a) GDPR',
        ],
      },
      {
        title: 'Mandatory vs. optional data',
        body: `Providing your email address is required to create your account. Providing meal photos and health data (weight, height, nutritional goals) is optional but necessary for AI analysis and nutritional tracking features. Refusing to provide this data does not prevent use of the app but limits available features (manual entry only).`,
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
          'Anthropic (Claude Haiku API) — United States — nutritional analysis of meal photos. Anthropic does not use API inputs to train models. Photos are not stored after processing.',
          'Supabase — Germany (EU) — database and authentication, EU servers (Frankfurt, Germany). DPA signed.',
          'RevenueCat — United States — in-app subscription management. DPA signed. No payment card data passes through our servers.',
          'PostHog — EU-hosted, US company — anonymous usage analytics. Initialized ONLY after user opt-in consent. No health data is sent to PostHog.',
          'Sentry — United States — error reporting. Initialized ONLY after user opt-in consent. No personal health data in error reports. DPA signed.',
        ],
      },
      {
        title: 'International Transfers',
        body: `Data sent to Anthropic (United States), RevenueCat (United States), PostHog (EU-hosted, US company), and Sentry (United States) is protected by Standard Contractual Clauses (SCCs) approved by the European Commission (Implementing Decision 2021/914), ensuring adequate protection under Articles 44-49 GDPR.`,
      },
      {
        title: 'How we use AI',
        body: `Your meal photos are sent to Anthropic's Claude API for nutritional analysis.\n\nBefore sending:\n• EXIF metadata (GPS, camera info) is stripped\n• Image is compressed (max 1024px, JPEG)\n\nAnthropic does not use API inputs to train models. Photos are processed in real-time and not stored on Anthropic's servers after processing.\n\nLegal basis: your explicit consent (Art. 6(1)(a) and Art. 9(2)(a) GDPR). You provide consent before your first analysis. You can withdraw consent at any time in Settings > Privacy.`,
      },
      {
        title: 'Automated Decision-Making (Article 22 GDPR)',
        body: `Kaly uses artificial intelligence (Claude AI, Anthropic) to automatically analyze your meal photos and estimate nutritional content (calories, macronutrients). These results are automated estimates provided for informational purposes only. No decision is made without your involvement — you can edit, correct, or delete any estimate. You have the right to request human intervention, express your point of view, and contest results via contact@growthor.ai.`,
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
          'Restriction of processing (Art. 18): you can request restriction of processing of your data in the cases provided by the GDPR, including when you contest the accuracy of your data or object to its processing',
          'Portability (Art. 20): export all your data as CSV',
          'Rectification (Art. 16): edit or correct your profile data at any time',
          'Right to object (Art. 21): you have the right to object to data processing',
          'Withdraw consent (Art. 7): withdraw your consent at any time in Settings > Privacy',
        ],
      },
      {
        title: 'Retention periods',
        items: [
          'Nutritional data (meals, calories): duration of active account',
          'Health data (weight, height, BMI): duration of active account',
          'Meal photos: not retained (deleted immediately after AI analysis)',
          'Analytics data (PostHog): 12 months',
          'Error data (Sentry): 90 days',
          'Payment data: 7 years (French tax obligation)',
          'After account deletion: permanent deletion within 30 days',
        ],
      },
      {
        title: 'Complaints',
        body: 'You may file a complaint with the CNIL (https://www.cnil.fr/fr/plaintes) if you believe your data processing is not GDPR-compliant.',
      },
      {
        title: 'Contact',
        body: 'For privacy inquiries: contact@growthor.ai\n\nKaly is operated by Dmitrii Sergueev, trading as "Growthor", Sole Proprietor (Entrepreneur individuel) — SIREN 944 537 034, SIRET 94453703400018, 117 Boulevard Président Wilson, 06600 Antibes, France.',
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
