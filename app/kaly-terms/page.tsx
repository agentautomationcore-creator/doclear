const html = `
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1E293B; background: #fff; line-height: 1.7; }
  .container { max-width: 720px; margin: 0 auto; padding: 40px 24px 80px; }
  .lang-switch { display: flex; gap: 12px; margin-bottom: 32px; }
  .lang-switch button { padding: 8px 20px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; cursor: pointer; font-size: 14px; font-weight: 500; color: #64748b; transition: all 0.2s; }
  .lang-switch button.active { background: #1E293B; color: #fff; border-color: #1E293B; }
  h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
  .subtitle { color: #64748b; font-size: 14px; margin-bottom: 40px; }
  h2 { font-size: 20px; font-weight: 600; margin: 32px 0 12px; }
  p, li { font-size: 15px; margin-bottom: 12px; }
  ul { padding-left: 24px; }
  li { margin-bottom: 8px; }
  a { color: #2563eb; }
  .section { margin-bottom: 24px; }
  .lang { display: none; }
  .lang.active { display: block; }
</style>

<div class="container">
  <div class="lang-switch">
    <button class="active" onclick="switchLang('en')">English</button>
    <button onclick="switchLang('fr')">Français</button>
  </div>

  <!-- ENGLISH -->
  <div id="en" class="lang active">
    <h1>Terms of Service — Kaly</h1>
    <p class="subtitle">Last updated: April 14, 2026</p>

    <div class="section">
      <h2>1. About Kaly</h2>
      <p>Kaly is an AI-powered calorie and nutrition tracking application ("the App") published by Dmitrii Sergueev, operating under the trade name "Growthor" (sole proprietorship — SIREN 944 537 034, Antibes, France). Contact: <a href="mailto:contact@kaly.app">contact@kaly.app</a>.</p>
    </div>

    <div class="section">
      <h2>2. Acceptance of Terms</h2>
      <p>By downloading, installing, or using Kaly, you agree to these Terms of Service. If you do not agree, do not use the App. We may update these Terms from time to time. Continued use after changes constitutes acceptance.</p>
    </div>

    <div class="section">
      <h2>3. Description of the Service</h2>
      <p>Kaly provides AI-assisted food logging (photo recognition, text input, voice input, barcode scanning), calorie and macronutrient tracking, water tracking, intermittent fasting timers, adaptive calorie goals, and nutrition statistics. The App uses artificial intelligence to estimate nutritional values. These estimates are approximate and should not be considered medical or dietary advice.</p>
    </div>

    <div class="section">
      <h2>4. Health Disclaimer</h2>
      <p>Kaly is a tracking tool, not a medical device. The AI-generated nutritional estimates are approximate and may contain errors. Kaly does not replace professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before making dietary changes, especially if you have medical conditions, eating disorders, allergies, or are pregnant or breastfeeding.</p>
    </div>

    <div class="section">
      <h2>5. Account and Access</h2>
      <p>You may use Kaly in anonymous mode (limited features) or create an account via Apple Sign-In or email. You are responsible for maintaining the confidentiality of your account credentials. You must be at least 12 years old to use the App. If you are between 12 and 16, you must have parental consent.</p>
    </div>

    <div class="section">
      <h2>6. Free and Premium Plans</h2>
      <p>Kaly offers a free tier (3 AI scans per day, basic tracking) and a Premium subscription (€4.99/month or €39.99/year) with unlimited AI scans and advanced features. All subscriptions include a 7-day free trial. Subscriptions are managed through Apple's App Store and are subject to Apple's terms. Auto-renewal may be turned off in your Apple ID settings at least 24 hours before the end of the current period. Refunds are handled by Apple in accordance with their refund policy.</p>
    </div>

    <div class="section">
      <h2>7. AI-Generated Content</h2>
      <p>Kaly uses AI (powered by Anthropic Claude) to analyze food photos, estimate calories, suggest meals, and detect hidden ingredients. AI results are estimates, not guarantees. Accuracy depends on image quality, food complexity, and portion visibility. You should verify critical nutritional information independently. We continuously improve AI accuracy but cannot guarantee error-free results.</p>
    </div>

    <div class="section">
      <h2>8. User Conduct</h2>
      <p>You agree not to: reverse engineer, decompile, or disassemble the App; use the App for any unlawful purpose; attempt to gain unauthorized access to our servers or databases; submit intentionally misleading content to manipulate AI models; use automated tools to scrape or extract data from the App.</p>
    </div>

    <div class="section">
      <h2>9. Intellectual Property</h2>
      <p>All content, design, code, AI models integration, and trademarks in Kaly are owned by Growthor (Dmitrii Sergueev) or its licensors. You retain ownership of the personal data and photos you submit. By using the App, you grant us a limited license to process your content solely for providing the service.</p>
    </div>

    <div class="section">
      <h2>10. Privacy</h2>
      <p>Your privacy matters. Please review our <a href="https://doclear.app/kaly-privacy">Privacy Policy</a> for details on how we collect, use, and protect your data. Key points: your food photos are processed by AI and not shared with third parties for advertising; all data is stored in the EU (Supabase Frankfurt); you can export or delete your data at any time.</p>
    </div>

    <div class="section">
      <h2>11. Limitation of Liability</h2>
      <p>To the maximum extent permitted by applicable law, Kaly and its operator shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the App, including but not limited to health outcomes based on AI estimates, data loss due to technical issues, or service interruptions. Our total liability shall not exceed the amount you paid for the App in the 12 months preceding the claim.</p>
    </div>

    <div class="section">
      <h2>12. Termination</h2>
      <p>You may stop using Kaly at any time by deleting your account (Profile → Delete Account) and uninstalling the App. We may suspend or terminate your access if you violate these Terms. Upon termination, your data will be deleted within 30 days in accordance with our Privacy Policy.</p>
    </div>

    <div class="section">
      <h2>13. Governing Law</h2>
      <p>These Terms are governed by the laws of France. Any disputes shall be submitted to the competent courts of Grasse, France. If you are an EU consumer, you may also use the European Online Dispute Resolution platform at <a href="https://ec.europa.eu/consumers/odr">ec.europa.eu/consumers/odr</a>.</p>
    </div>

    <div class="section">
      <h2>14. Contact</h2>
      <p>For any questions about these Terms: <a href="mailto:contact@kaly.app">contact@kaly.app</a></p>
    </div>
  </div>

  <!-- FRANÇAIS -->
  <div id="fr" class="lang">
    <h1>Conditions d'Utilisation — Kaly</h1>
    <p class="subtitle">Dernière mise à jour : 14 avril 2026</p>

    <div class="section">
      <h2>1. À propos de Kaly</h2>
      <p>Kaly est une application de suivi de calories et de nutrition assistée par IA (« l'Application »), éditée par Dmitrii Sergueev, exerçant sous le nom commercial « Growthor » (entreprise individuelle — SIREN 944 537 034, Antibes, France). Contact : <a href="mailto:contact@kaly.app">contact@kaly.app</a>.</p>
    </div>

    <div class="section">
      <h2>2. Acceptation des conditions</h2>
      <p>En téléchargeant, installant ou utilisant Kaly, vous acceptez les présentes Conditions d'Utilisation. Si vous n'êtes pas d'accord, n'utilisez pas l'Application. Nous pouvons mettre à jour ces Conditions. L'utilisation continue après modification vaut acceptation.</p>
    </div>

    <div class="section">
      <h2>3. Description du service</h2>
      <p>Kaly propose un suivi alimentaire assisté par IA (reconnaissance photo, saisie texte, saisie vocale, scan de codes-barres), un suivi des calories et macronutriments, un suivi de l'hydratation, des minuteurs de jeûne intermittent, des objectifs caloriques adaptatifs et des statistiques nutritionnelles. L'Application utilise l'intelligence artificielle pour estimer les valeurs nutritionnelles. Ces estimations sont approximatives et ne constituent pas un avis médical ou diététique.</p>
    </div>

    <div class="section">
      <h2>4. Avertissement santé</h2>
      <p>Kaly est un outil de suivi, pas un dispositif médical. Les estimations nutritionnelles générées par l'IA sont approximatives et peuvent contenir des erreurs. Kaly ne remplace pas un avis médical professionnel, un diagnostic ou un traitement. Consultez toujours un professionnel de santé qualifié avant de modifier votre alimentation, en particulier si vous avez des conditions médicales, des troubles alimentaires, des allergies, ou si vous êtes enceinte ou allaitez.</p>
    </div>

    <div class="section">
      <h2>5. Compte et accès</h2>
      <p>Vous pouvez utiliser Kaly en mode anonyme (fonctionnalités limitées) ou créer un compte via Apple Sign-In ou e-mail. Vous êtes responsable de la confidentialité de vos identifiants. Vous devez avoir au moins 12 ans pour utiliser l'Application. Entre 12 et 16 ans, le consentement parental est requis.</p>
    </div>

    <div class="section">
      <h2>6. Offres gratuite et Premium</h2>
      <p>Kaly propose une offre gratuite (3 scans IA par jour, suivi de base) et un abonnement Premium (4,99 €/mois ou 39,99 €/an) avec scans IA illimités et fonctionnalités avancées. Tous les abonnements incluent un essai gratuit de 7 jours. Les abonnements sont gérés via l'App Store d'Apple et soumis aux conditions d'Apple. Le renouvellement automatique peut être désactivé dans les réglages de votre identifiant Apple au moins 24 heures avant la fin de la période en cours. Les remboursements sont gérés par Apple conformément à sa politique de remboursement.</p>
    </div>

    <div class="section">
      <h2>7. Contenu généré par l'IA</h2>
      <p>Kaly utilise l'IA (propulsée par Anthropic Claude) pour analyser les photos d'aliments, estimer les calories, suggérer des repas et détecter les ingrédients cachés. Les résultats de l'IA sont des estimations, pas des garanties. La précision dépend de la qualité de l'image, de la complexité du plat et de la visibilité des portions. Vous devez vérifier de manière indépendante les informations nutritionnelles critiques. Nous améliorons continuellement la précision de l'IA mais ne pouvons garantir des résultats sans erreur.</p>
    </div>

    <div class="section">
      <h2>8. Comportement de l'utilisateur</h2>
      <p>Vous vous engagez à ne pas : procéder à l'ingénierie inverse, décompiler ou désassembler l'Application ; utiliser l'Application à des fins illégales ; tenter d'accéder sans autorisation à nos serveurs ou bases de données ; soumettre du contenu intentionnellement trompeur pour manipuler les modèles d'IA ; utiliser des outils automatisés pour extraire des données de l'Application.</p>
    </div>

    <div class="section">
      <h2>9. Propriété intellectuelle</h2>
      <p>Tout le contenu, design, code, intégration de modèles d'IA et marques de Kaly sont la propriété de Growthor (Dmitrii Sergueev) ou de ses concédants. Vous conservez la propriété des données personnelles et photos que vous soumettez. En utilisant l'Application, vous nous accordez une licence limitée pour traiter votre contenu uniquement aux fins de fourniture du service.</p>
    </div>

    <div class="section">
      <h2>10. Confidentialité</h2>
      <p>Votre vie privée est importante. Consultez notre <a href="https://doclear.app/kaly-privacy">Politique de Confidentialité</a> pour en savoir plus sur la collecte, l'utilisation et la protection de vos données. Points clés : vos photos d'aliments sont traitées par l'IA et ne sont pas partagées avec des tiers à des fins publicitaires ; toutes les données sont stockées dans l'UE (Supabase Frankfurt) ; vous pouvez exporter ou supprimer vos données à tout moment.</p>
    </div>

    <div class="section">
      <h2>11. Limitation de responsabilité</h2>
      <p>Dans les limites permises par la loi applicable, Kaly et son éditeur ne pourront être tenus responsables de tout dommage indirect, accessoire, spécial ou consécutif résultant de votre utilisation de l'Application, y compris mais sans s'y limiter les conséquences sur la santé basées sur les estimations de l'IA, la perte de données due à des problèmes techniques ou les interruptions de service. Notre responsabilité totale ne saurait excéder le montant que vous avez payé pour l'Application au cours des 12 mois précédant la réclamation.</p>
    </div>

    <div class="section">
      <h2>12. Résiliation</h2>
      <p>Vous pouvez cesser d'utiliser Kaly à tout moment en supprimant votre compte (Profil → Supprimer le compte) et en désinstallant l'Application. Nous pouvons suspendre ou résilier votre accès en cas de violation de ces Conditions. En cas de résiliation, vos données seront supprimées sous 30 jours conformément à notre Politique de Confidentialité.</p>
    </div>

    <div class="section">
      <h2>13. Droit applicable</h2>
      <p>Les présentes Conditions sont régies par le droit français. Tout litige sera soumis aux tribunaux compétents de Grasse, France. Si vous êtes un consommateur de l'UE, vous pouvez également utiliser la plateforme européenne de résolution des litiges en ligne à l'adresse <a href="https://ec.europa.eu/consumers/odr">ec.europa.eu/consumers/odr</a>.</p>
    </div>

    <div class="section">
      <h2>14. Contact</h2>
      <p>Pour toute question relative aux présentes Conditions : <a href="mailto:contact@kaly.app">contact@kaly.app</a></p>
    </div>
  </div>
</div>

<script>
function switchLang(lang) {
  document.querySelectorAll('.lang').forEach(el => el.classList.remove('active'));
  document.getElementById(lang).classList.add('active');
  document.querySelectorAll('.lang-switch button').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  document.documentElement.lang = lang === 'fr' ? 'fr' : 'en';
}
</script>
`;

export default function KalyTermsPage() {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
