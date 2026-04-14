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
  table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
  th, td { padding: 10px 12px; border: 1px solid #e2e8f0; text-align: left; }
  th { background: #f8fafc; font-weight: 600; }
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
    <h1>Privacy Policy — Kaly</h1>
    <p class="subtitle">Last updated: April 14, 2026</p>

    <div class="section">
      <h2>1. Data Controller</h2>
      <p>Dmitrii Sergueev, operating under the trade name "Growthor"<br>
      Sole proprietorship (EI) — SIREN 944 537 034<br>
      Antibes, France<br>
      Contact: <a href="mailto:hello@growthor.ai">hello@growthor.ai</a></p>
    </div>

    <div class="section">
      <h2>2. Data We Collect</h2>
      <p>Kaly collects the following data, depending on how you use the App:</p>
      <ul>
        <li><strong>Account data:</strong> email address, authentication method (Apple Sign-In, email). In anonymous mode, only a unique technical identifier is generated — no personal information is required.</li>
        <li><strong>Nutrition data:</strong> food diary entries (meals, calories, macronutrients), water intake, weight log, nutrition goals, dietary preferences, and allergy information.</li>
        <li><strong>Food photos:</strong> images you take for AI analysis. These are sent to our AI provider for processing and are not stored on our servers after analysis is complete.</li>
        <li><strong>Health data:</strong> with your explicit consent, Kaly reads steps and active calories from Apple Health, and writes food energy, water, and weight data to Apple Health.</li>
        <li><strong>Usage data:</strong> interface language, feature interactions, streak data. Collected only after your consent via PostHog (EU servers).</li>
        <li><strong>Technical data:</strong> device type, OS version, app version, crash reports. Collected via Sentry (EU ingest) only after your consent.</li>
      </ul>
    </div>

    <div class="section">
      <h2>3. Purposes and Legal Basis</h2>
      <table>
        <tr><th>Purpose</th><th>Legal Basis</th></tr>
        <tr><td>AI food analysis (photo, text, voice)</td><td>Consent (Article 6.1.a GDPR)</td></tr>
        <tr><td>Apple Health integration</td><td>Consent (Article 6.1.a GDPR)</td></tr>
        <tr><td>Service delivery (account, diary, tracking)</td><td>Performance of contract (Article 6.1.b GDPR)</td></tr>
        <tr><td>Subscription management</td><td>Performance of contract (Article 6.1.b GDPR)</td></tr>
        <tr><td>Analytics and app improvement</td><td>Consent (Article 6.1.a GDPR)</td></tr>
        <tr><td>Error tracking and crash reports</td><td>Consent (Article 6.1.a GDPR)</td></tr>
      </table>
    </div>

    <div class="section">
      <h2>4. Consent Model</h2>
      <p>On first launch, Kaly presents a consent modal with three independent toggles:</p>
      <ul>
        <li><strong>AI Analysis:</strong> allows food photos and text to be processed by AI. Required for AI features; can be disabled at any time.</li>
        <li><strong>Health Data:</strong> allows reading/writing Apple Health data. Fully optional.</li>
        <li><strong>Analytics:</strong> allows anonymous usage analytics and crash reports. Fully optional.</li>
      </ul>
      <p>You can change these preferences at any time in Settings. The App functions without AI and Health consent, using manual entry and barcode scanning.</p>
    </div>

    <div class="section">
      <h2>5. Third-Party Processors</h2>
      <p>Your data may be shared with the following service providers, all GDPR-compliant:</p>
      <table>
        <tr><th>Provider</th><th>Role</th><th>Location</th></tr>
        <tr><td>Anthropic (Claude AI)</td><td>AI food analysis (photo + text)</td><td>United States (DPA signed)</td></tr>
        <tr><td>Supabase</td><td>Database, authentication, Edge Functions</td><td>EU — Frankfurt, Germany</td></tr>
        <tr><td>RevenueCat</td><td>Subscription management</td><td>United States (DPA signed)</td></tr>
        <tr><td>Apple (App Store / HealthKit)</td><td>Payments, health data sync</td><td>United States / EU</td></tr>
        <tr><td>OpenFoodFacts</td><td>Barcode food database (open source)</td><td>France</td></tr>
        <tr><td>PostHog</td><td>Usage analytics (anonymized)</td><td>EU</td></tr>
        <tr><td>Sentry</td><td>Error and crash tracking</td><td>EU ingest (DPA signed)</td></tr>
      </table>
      <p>We never sell your data to third parties. We do not use your data for targeted advertising. We do not share your food photos or diary with advertisers.</p>
    </div>

    <div class="section">
      <h2>6. Food Photo Processing</h2>
      <p>When you use AI photo scanning, your food image is sent to Anthropic's Claude AI via our secure Edge Function (hosted on Supabase EU). The image is used solely for nutritional analysis and is not stored by Anthropic after processing. We do not build a database of your food photos. The AI response (nutritional estimates) is stored in your diary on Supabase EU.</p>
    </div>

    <div class="section">
      <h2>7. Data Retention</h2>
      <ul>
        <li><strong>Diary entries and nutrition data:</strong> retained as long as your account is active.</li>
        <li><strong>After account deletion:</strong> all personal data is deleted within 30 days.</li>
        <li><strong>Inactive anonymous accounts:</strong> deleted after 90 days of inactivity.</li>
        <li><strong>Food photos:</strong> not stored after AI analysis is complete.</li>
        <li><strong>Payment data:</strong> managed by Apple and RevenueCat in accordance with their legal obligations.</li>
      </ul>
    </div>

    <div class="section">
      <h2>8. International Transfers</h2>
      <p>Your primary data is stored in the EU (Supabase Frankfurt). Some processors (Anthropic, RevenueCat) are located in the United States. These transfers are governed by EU Standard Contractual Clauses (SCCs) and Data Processing Agreements (DPAs) signed with each provider.</p>
    </div>

    <div class="section">
      <h2>9. Your Rights</h2>
      <p>Under the GDPR, you have the following rights:</p>
      <ul>
        <li><strong>Access:</strong> obtain a copy of your personal data (in-app: Profile → Export Data).</li>
        <li><strong>Rectification:</strong> correct inaccurate data directly in the App.</li>
        <li><strong>Erasure:</strong> delete your account and all data (in-app: Profile → Delete Account).</li>
        <li><strong>Portability:</strong> export your data in PDF format from the App.</li>
        <li><strong>Objection:</strong> object to processing based on legitimate interest.</li>
        <li><strong>Withdraw consent:</strong> disable AI analysis, Health data, or Analytics at any time in Settings.</li>
      </ul>
      <p>To exercise these rights: <a href="mailto:hello@growthor.ai">hello@growthor.ai</a>. We will respond within 30 days. You may also file a complaint with the CNIL (<a href="https://www.cnil.fr">www.cnil.fr</a>) or your local data protection authority.</p>
    </div>

    <div class="section">
      <h2>10. Security</h2>
      <p>Your data is protected by: encryption in transit (TLS 1.2+) and at rest, secure authentication (Supabase Auth with bcrypt), Row Level Security (RLS) policies ensuring you can only access your own data, API key authentication on all Edge Functions, and Sentry monitoring for security anomalies.</p>
    </div>

    <div class="section">
      <h2>11. Children</h2>
      <p>Kaly is intended for users aged 12 and above. Users between 12 and 16 must have parental consent. We do not knowingly collect data from children under 12. If you believe a child under 12 has provided data, contact us for immediate deletion.</p>
    </div>

    <div class="section">
      <h2>12. Changes</h2>
      <p>This policy may be updated. In case of material changes, you will be notified through the App. The update date is shown at the top of this page.</p>
    </div>

    <div class="section">
      <h2>13. Contact</h2>
      <p>For any privacy-related questions: <a href="mailto:hello@growthor.ai">hello@growthor.ai</a></p>
    </div>
  </div>

  <!-- FRANÇAIS -->
  <div id="fr" class="lang">
    <h1>Politique de Confidentialité — Kaly</h1>
    <p class="subtitle">Dernière mise à jour : 14 avril 2026</p>

    <div class="section">
      <h2>1. Responsable du traitement</h2>
      <p>Dmitrii Sergueev, exerçant sous le nom commercial « Growthor »<br>
      Entreprise individuelle — SIREN 944 537 034<br>
      Antibes, France<br>
      Contact : <a href="mailto:hello@growthor.ai">hello@growthor.ai</a></p>
    </div>

    <div class="section">
      <h2>2. Données collectées</h2>
      <p>Kaly collecte les données suivantes, selon votre utilisation de l'Application :</p>
      <ul>
        <li><strong>Données de compte :</strong> adresse e-mail, méthode d'authentification (Apple Sign-In, e-mail). En mode anonyme, seul un identifiant technique unique est généré — aucune information personnelle n'est requise.</li>
        <li><strong>Données nutritionnelles :</strong> entrées du journal alimentaire (repas, calories, macronutriments), consommation d'eau, suivi du poids, objectifs nutritionnels, préférences alimentaires et informations sur les allergies.</li>
        <li><strong>Photos d'aliments :</strong> images prises pour l'analyse IA. Elles sont envoyées à notre fournisseur d'IA pour traitement et ne sont pas conservées sur nos serveurs après l'analyse.</li>
        <li><strong>Données de santé :</strong> avec votre consentement explicite, Kaly lit les pas et calories actives depuis Apple Santé, et y écrit les données d'énergie alimentaire, d'eau et de poids.</li>
        <li><strong>Données d'utilisation :</strong> langue de l'interface, interactions avec les fonctionnalités, données de série. Collectées uniquement après votre consentement via PostHog (serveurs UE).</li>
        <li><strong>Données techniques :</strong> type d'appareil, version de l'OS, version de l'app, rapports d'erreurs. Collectées via Sentry (ingestion UE) uniquement après votre consentement.</li>
      </ul>
    </div>

    <div class="section">
      <h2>3. Finalités et bases légales</h2>
      <table>
        <tr><th>Finalité</th><th>Base légale</th></tr>
        <tr><td>Analyse alimentaire IA (photo, texte, voix)</td><td>Consentement (Article 6.1.a RGPD)</td></tr>
        <tr><td>Intégration Apple Santé</td><td>Consentement (Article 6.1.a RGPD)</td></tr>
        <tr><td>Fourniture du service (compte, journal, suivi)</td><td>Exécution du contrat (Article 6.1.b RGPD)</td></tr>
        <tr><td>Gestion des abonnements</td><td>Exécution du contrat (Article 6.1.b RGPD)</td></tr>
        <tr><td>Analytique et amélioration de l'app</td><td>Consentement (Article 6.1.a RGPD)</td></tr>
        <tr><td>Suivi des erreurs et rapports de crash</td><td>Consentement (Article 6.1.a RGPD)</td></tr>
      </table>
    </div>

    <div class="section">
      <h2>4. Modèle de consentement</h2>
      <p>Au premier lancement, Kaly présente une fenêtre de consentement avec trois options indépendantes :</p>
      <ul>
        <li><strong>Analyse IA :</strong> permet le traitement des photos et textes par l'IA. Nécessaire pour les fonctionnalités IA ; peut être désactivé à tout moment.</li>
        <li><strong>Données de santé :</strong> permet la lecture/écriture des données Apple Santé. Entièrement optionnel.</li>
        <li><strong>Analytique :</strong> permet l'analyse anonyme de l'utilisation et les rapports d'erreurs. Entièrement optionnel.</li>
      </ul>
      <p>Vous pouvez modifier ces préférences à tout moment dans les Réglages. L'Application fonctionne sans consentement IA et Santé, en utilisant la saisie manuelle et le scan de codes-barres.</p>
    </div>

    <div class="section">
      <h2>5. Sous-traitants</h2>
      <p>Vos données peuvent être transmises aux prestataires suivants, tous conformes au RGPD :</p>
      <table>
        <tr><th>Prestataire</th><th>Rôle</th><th>Localisation</th></tr>
        <tr><td>Anthropic (Claude AI)</td><td>Analyse alimentaire IA (photo + texte)</td><td>États-Unis (DPA signé)</td></tr>
        <tr><td>Supabase</td><td>Base de données, authentification, Edge Functions</td><td>UE — Francfort, Allemagne</td></tr>
        <tr><td>RevenueCat</td><td>Gestion des abonnements</td><td>États-Unis (DPA signé)</td></tr>
        <tr><td>Apple (App Store / HealthKit)</td><td>Paiements, synchronisation données de santé</td><td>États-Unis / UE</td></tr>
        <tr><td>OpenFoodFacts</td><td>Base de données alimentaire codes-barres (open source)</td><td>France</td></tr>
        <tr><td>PostHog</td><td>Analytique d'utilisation (anonymisée)</td><td>UE</td></tr>
        <tr><td>Sentry</td><td>Suivi des erreurs et crashs</td><td>Ingestion UE (DPA signé)</td></tr>
      </table>
      <p>Aucune donnée n'est vendue à des tiers. Aucune donnée n'est utilisée pour de la publicité ciblée. Nous ne partageons pas vos photos d'aliments ou votre journal avec des annonceurs.</p>
    </div>

    <div class="section">
      <h2>6. Traitement des photos d'aliments</h2>
      <p>Lorsque vous utilisez le scan photo IA, votre image est envoyée à l'IA Claude d'Anthropic via notre Edge Function sécurisée (hébergée sur Supabase UE). L'image est utilisée uniquement pour l'analyse nutritionnelle et n'est pas conservée par Anthropic après traitement. Nous ne constituons pas de base de données de vos photos d'aliments. La réponse de l'IA (estimations nutritionnelles) est stockée dans votre journal sur Supabase UE.</p>
    </div>

    <div class="section">
      <h2>7. Conservation des données</h2>
      <ul>
        <li><strong>Entrées du journal et données nutritionnelles :</strong> conservées tant que votre compte est actif.</li>
        <li><strong>Après suppression du compte :</strong> toutes les données personnelles sont supprimées sous 30 jours.</li>
        <li><strong>Comptes anonymes inactifs :</strong> supprimés après 90 jours d'inactivité.</li>
        <li><strong>Photos d'aliments :</strong> non conservées après la fin de l'analyse IA.</li>
        <li><strong>Données de paiement :</strong> gérées par Apple et RevenueCat conformément à leurs obligations légales.</li>
      </ul>
    </div>

    <div class="section">
      <h2>8. Transferts internationaux</h2>
      <p>Vos données principales sont stockées dans l'UE (Supabase Francfort). Certains sous-traitants (Anthropic, RevenueCat) sont situés aux États-Unis. Ces transferts sont encadrés par des clauses contractuelles types (SCC) de la Commission européenne et des accords de traitement des données (DPA) signés avec chaque prestataire.</p>
    </div>

    <div class="section">
      <h2>9. Vos droits</h2>
      <p>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li><strong>Accès :</strong> obtenir une copie de vos données personnelles (dans l'app : Profil → Exporter les données).</li>
        <li><strong>Rectification :</strong> corriger vos données inexactes directement dans l'Application.</li>
        <li><strong>Suppression :</strong> supprimer votre compte et toutes vos données (dans l'app : Profil → Supprimer le compte).</li>
        <li><strong>Portabilité :</strong> exporter vos données au format PDF depuis l'Application.</li>
        <li><strong>Opposition :</strong> vous opposer au traitement basé sur l'intérêt légitime.</li>
        <li><strong>Retrait du consentement :</strong> désactiver l'analyse IA, les données de Santé ou l'Analytique à tout moment dans les Réglages.</li>
      </ul>
      <p>Pour exercer ces droits : <a href="mailto:hello@growthor.ai">hello@growthor.ai</a>. Réponse sous 30 jours. Vous pouvez également introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr">www.cnil.fr</a>) ou de votre autorité de protection des données locale.</p>
    </div>

    <div class="section">
      <h2>10. Sécurité</h2>
      <p>Vos données sont protégées par : chiffrement en transit (TLS 1.2+) et au repos, authentification sécurisée (Supabase Auth avec bcrypt), politiques de sécurité au niveau des lignes (RLS) garantissant que vous ne pouvez accéder qu'à vos propres données, authentification par clé API sur toutes les Edge Functions, et surveillance Sentry pour les anomalies de sécurité.</p>
    </div>

    <div class="section">
      <h2>11. Mineurs</h2>
      <p>Kaly est destiné aux utilisateurs de 12 ans et plus. Les utilisateurs de 12 à 16 ans doivent avoir le consentement parental. Aucune donnée n'est sciemment collectée auprès d'enfants de moins de 12 ans. Si vous pensez qu'un enfant de moins de 12 ans a fourni des données, contactez-nous pour une suppression immédiate.</p>
    </div>

    <div class="section">
      <h2>12. Modifications</h2>
      <p>Cette politique peut être mise à jour. En cas de modification substantielle, vous serez informé(e) via l'Application. La date de mise à jour est indiquée en haut de cette page.</p>
    </div>

    <div class="section">
      <h2>13. Contact</h2>
      <p>Pour toute question relative à la confidentialité : <a href="mailto:hello@growthor.ai">hello@growthor.ai</a></p>
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

export default function KalyPrivacyPage() {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
