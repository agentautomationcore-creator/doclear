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

const content: Record<'en' | 'fr', LangContent> = {
  en: {
    title: 'Terms of Service — Kaly',
    lastUpdated: 'Last updated: April 14, 2026',
    switchLang: 'Français',
    sections: [
      {
        title: '1. About Kaly',
        body: 'Kaly is an AI-powered calorie and nutrition tracking application ("the App") published by Dmitrii Sergueev, operating under the trade name "Growthor" (sole proprietorship — SIREN 944 537 034, Antibes, France). Contact: contact@kaly.app.',
      },
      {
        title: '2. Acceptance of Terms',
        body: 'By downloading, installing, or using Kaly, you agree to these Terms of Service. If you do not agree, do not use the App. We may update these Terms from time to time. Continued use after changes constitutes acceptance.',
      },
      {
        title: '3. Description of the Service',
        body: 'Kaly provides AI-assisted food logging (photo recognition, text input, voice input, barcode scanning), calorie and macronutrient tracking, water tracking, intermittent fasting timers, adaptive calorie goals, and nutrition statistics. The App uses artificial intelligence to estimate nutritional values. These estimates are approximate and should not be considered medical or dietary advice.',
      },
      {
        title: '4. Health Disclaimer',
        body: 'Kaly is a tracking tool, not a medical device. The AI-generated nutritional estimates are approximate and may contain errors. Kaly does not replace professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before making dietary changes, especially if you have medical conditions, eating disorders, allergies, or are pregnant or breastfeeding.',
      },
      {
        title: '5. Account and Access',
        body: 'You may use Kaly in anonymous mode (limited features) or create an account via Apple Sign-In or email. You are responsible for maintaining the confidentiality of your account credentials. You must be at least 12 years old to use the App. If you are between 12 and 16, you must have parental consent.',
      },
      {
        title: '6. Free and Premium Plans',
        body: 'Kaly offers a free tier (3 AI scans per day, basic tracking) and a Premium subscription (€4.99/month or €39.99/year) with unlimited AI scans and advanced features. All subscriptions include a 7-day free trial. Subscriptions are managed through Apple\'s App Store and are subject to Apple\'s terms. Auto-renewal may be turned off in your Apple ID settings at least 24 hours before the end of the current period. Refunds are handled by Apple in accordance with their refund policy.',
      },
      {
        title: '7. AI-Generated Content',
        body: 'Kaly uses AI (powered by Anthropic Claude) to analyze food photos, estimate calories, suggest meals, and detect hidden ingredients. AI results are estimates, not guarantees. Accuracy depends on image quality, food complexity, and portion visibility. You should verify critical nutritional information independently. We continuously improve AI accuracy but cannot guarantee error-free results.',
      },
      {
        title: '8. User Conduct',
        items: [
          'Do not reverse engineer, decompile, or disassemble the App',
          'Do not use the App for any unlawful purpose',
          'Do not attempt to gain unauthorized access to our servers or databases',
          'Do not submit intentionally misleading content to manipulate AI models',
          'Do not use automated tools to scrape or extract data from the App',
        ],
      },
      {
        title: '9. Intellectual Property',
        body: 'All content, design, code, AI models integration, and trademarks in Kaly are owned by Growthor (Dmitrii Sergueev) or its licensors. You retain ownership of the personal data and photos you submit. By using the App, you grant us a limited license to process your content solely for providing the service.',
      },
      {
        title: '10. Privacy',
        body: 'Your privacy matters. Please review our Privacy Policy (https://doclear.app/kaly-privacy) for details on how we collect, use, and protect your data. Key points: your food photos are processed by AI and not shared with third parties for advertising; all data is stored in the EU (Supabase Frankfurt); you can export or delete your data at any time.',
      },
      {
        title: '11. Limitation of Liability',
        body: 'To the maximum extent permitted by applicable law, Kaly and its operator shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the App, including but not limited to health outcomes based on AI estimates, data loss due to technical issues, or service interruptions. Our total liability shall not exceed the amount you paid for the App in the 12 months preceding the claim.',
      },
      {
        title: '12. Termination',
        body: 'You may stop using Kaly at any time by deleting your account (Profile > Delete Account) and uninstalling the App. We may suspend or terminate your access if you violate these Terms. Upon termination, your data will be deleted within 30 days in accordance with our Privacy Policy.',
      },
      {
        title: '13. Governing Law',
        body: 'These Terms are governed by the laws of France. Any disputes shall be submitted to the competent courts of Grasse, France. If you are an EU consumer, you may also use the European Online Dispute Resolution platform at ec.europa.eu/consumers/odr.',
      },
      {
        title: '14. Contact',
        body: 'For any questions about these Terms: contact@kaly.app',
      },
    ],
  },
  fr: {
    title: "Conditions d'Utilisation — Kaly",
    lastUpdated: 'Dernière mise à jour : 14 avril 2026',
    switchLang: 'English',
    sections: [
      {
        title: '1. À propos de Kaly',
        body: "Kaly est une application de suivi de calories et de nutrition assistée par IA (« l'Application »), éditée par Dmitrii Sergueev, exerçant sous le nom commercial « Growthor » (entreprise individuelle — SIREN 944 537 034, Antibes, France). Contact : contact@kaly.app.",
      },
      {
        title: "2. Acceptation des conditions",
        body: "En téléchargeant, installant ou utilisant Kaly, vous acceptez les présentes Conditions d'Utilisation. Si vous n'êtes pas d'accord, n'utilisez pas l'Application. Nous pouvons mettre à jour ces Conditions. L'utilisation continue après modification vaut acceptation.",
      },
      {
        title: '3. Description du service',
        body: "Kaly propose un suivi alimentaire assisté par IA (reconnaissance photo, saisie texte, saisie vocale, scan de codes-barres), un suivi des calories et macronutriments, un suivi de l'hydratation, des minuteurs de jeûne intermittent, des objectifs caloriques adaptatifs et des statistiques nutritionnelles. L'Application utilise l'intelligence artificielle pour estimer les valeurs nutritionnelles. Ces estimations sont approximatives et ne constituent pas un avis médical ou diététique.",
      },
      {
        title: '4. Avertissement santé',
        body: "Kaly est un outil de suivi, pas un dispositif médical. Les estimations nutritionnelles générées par l'IA sont approximatives et peuvent contenir des erreurs. Kaly ne remplace pas un avis médical professionnel, un diagnostic ou un traitement. Consultez toujours un professionnel de santé qualifié avant de modifier votre alimentation, en particulier si vous avez des conditions médicales, des troubles alimentaires, des allergies, ou si vous êtes enceinte ou allaitez.",
      },
      {
        title: '5. Compte et accès',
        body: "Vous pouvez utiliser Kaly en mode anonyme (fonctionnalités limitées) ou créer un compte via Apple Sign-In ou e-mail. Vous êtes responsable de la confidentialité de vos identifiants. Vous devez avoir au moins 12 ans pour utiliser l'Application. Entre 12 et 16 ans, le consentement parental est requis.",
      },
      {
        title: '6. Offres gratuite et Premium',
        body: "Kaly propose une offre gratuite (3 scans IA par jour, suivi de base) et un abonnement Premium (4,99 €/mois ou 39,99 €/an) avec scans IA illimités et fonctionnalités avancées. Tous les abonnements incluent un essai gratuit de 7 jours. Les abonnements sont gérés via l'App Store d'Apple et soumis aux conditions d'Apple. Le renouvellement automatique peut être désactivé dans les réglages de votre identifiant Apple au moins 24 heures avant la fin de la période en cours. Les remboursements sont gérés par Apple conformément à sa politique de remboursement.",
      },
      {
        title: "7. Contenu généré par l'IA",
        body: "Kaly utilise l'IA (propulsée par Anthropic Claude) pour analyser les photos d'aliments, estimer les calories, suggérer des repas et détecter les ingrédients cachés. Les résultats de l'IA sont des estimations, pas des garanties. La précision dépend de la qualité de l'image, de la complexité du plat et de la visibilité des portions. Vous devez vérifier de manière indépendante les informations nutritionnelles critiques. Nous améliorons continuellement la précision de l'IA mais ne pouvons garantir des résultats sans erreur.",
      },
      {
        title: "8. Comportement de l'utilisateur",
        items: [
          "Ne pas procéder à l'ingénierie inverse, décompiler ou désassembler l'Application",
          "Ne pas utiliser l'Application à des fins illégales",
          "Ne pas tenter d'accéder sans autorisation à nos serveurs ou bases de données",
          "Ne pas soumettre du contenu intentionnellement trompeur pour manipuler les modèles d'IA",
          "Ne pas utiliser des outils automatisés pour extraire des données de l'Application",
        ],
      },
      {
        title: '9. Propriété intellectuelle',
        body: "Tout le contenu, design, code, intégration de modèles d'IA et marques de Kaly sont la propriété de Growthor (Dmitrii Sergueev) ou de ses concédants. Vous conservez la propriété des données personnelles et photos que vous soumettez. En utilisant l'Application, vous nous accordez une licence limitée pour traiter votre contenu uniquement aux fins de fourniture du service.",
      },
      {
        title: '10. Confidentialité',
        body: "Votre vie privée est importante. Consultez notre Politique de Confidentialité (https://doclear.app/kaly-privacy) pour en savoir plus sur la collecte, l'utilisation et la protection de vos données. Points clés : vos photos d'aliments sont traitées par l'IA et ne sont pas partagées avec des tiers à des fins publicitaires ; toutes les données sont stockées dans l'UE (Supabase Frankfurt) ; vous pouvez exporter ou supprimer vos données à tout moment.",
      },
      {
        title: '11. Limitation de responsabilité',
        body: "Dans les limites permises par la loi applicable, Kaly et son éditeur ne pourront être tenus responsables de tout dommage indirect, accessoire, spécial ou consécutif résultant de votre utilisation de l'Application, y compris mais sans s'y limiter les conséquences sur la santé basées sur les estimations de l'IA, la perte de données due à des problèmes techniques ou les interruptions de service. Notre responsabilité totale ne saurait excéder le montant que vous avez payé pour l'Application au cours des 12 mois précédant la réclamation.",
      },
      {
        title: '12. Résiliation',
        body: "Vous pouvez cesser d'utiliser Kaly à tout moment en supprimant votre compte (Profil > Supprimer le compte) et en désinstallant l'Application. Nous pouvons suspendre ou résilier votre accès en cas de violation de ces Conditions. En cas de résiliation, vos données seront supprimées sous 30 jours conformément à notre Politique de Confidentialité.",
      },
      {
        title: '13. Droit applicable',
        body: "Les présentes Conditions sont régies par le droit français. Tout litige sera soumis aux tribunaux compétents de Grasse, France. Si vous êtes un consommateur de l'UE, vous pouvez également utiliser la plateforme européenne de résolution des litiges en ligne à l'adresse ec.europa.eu/consumers/odr.",
      },
      {
        title: '14. Contact',
        body: 'Pour toute question relative aux présentes Conditions : contact@kaly.app',
      },
    ],
  },
};

export default function KalyTermsPage() {
  const [lang, setLang] = useState<'en' | 'fr'>('en');
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
          onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
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
