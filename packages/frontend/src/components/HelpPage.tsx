import { X } from 'lucide-react';
import type { Language } from '../lib/types';

interface Props {
  onClose: () => void;
  language: Language;
}

const t = {
  en: {
    title: 'Frameworks Guide',
    carTitle: 'CAR Framework',
    carSubtitle: 'Challenge · Action · Result',
    carIntro: 'The CAR framework is a structured storytelling technique for describing professional achievements. It forces you to move beyond vague job-duty descriptions and present every accomplishment as a mini narrative: what was broken or difficult, what you specifically did about it, and what measurably improved as a result. Recruiters and hiring managers scan for this pattern because it proves impact rather than just presence.',
    challengeTitle: 'C — Challenge',
    challengeDesc: 'Describe the problem, constraint, gap, or opportunity that required action. Be specific: numbers, context, and stakes make the challenge feel real. Avoid generic phrases like "we had issues with performance" — quantify the pain instead.',
    challengeExample: '"Our CI/CD pipeline averaged 45-minute build times, causing developers to wait over 2 hours per day for feedback and delaying every release by at least one sprint."',
    actionTitle: 'A — Action',
    actionDesc: 'Describe what you did — not the team, not the project. Use first-person verbs: designed, implemented, negotiated, automated, led. Include the tools, methods, and decisions you made. This is where your skills become visible.',
    actionExample: '"I analysed bottlenecks using BuildKite traces, introduced incremental Docker layer caching, parallelised test suites across 8 agents, and migrated the artifact store from S3 to a local registry."',
    resultTitle: 'R — Result',
    resultDesc: 'State the measurable outcome. Quantify wherever possible: percentages, time saved, money saved, users unblocked, error rates reduced. If exact numbers are confidential, use relative figures ("reduced by ~60%") or business impact ("enabled fortnightly releases instead of quarterly").',
    resultExample: '"Build time dropped from 45 min to 8 min (–82%), saving the 12-person team ~1.5 hours of idle time per day and allowing us to ship to production daily instead of weekly."',
    fullExampleLabel: 'Complete CAR Example',
    fullChallenge: 'Our CI/CD pipeline averaged 45-minute build times, causing developers to wait over 2 hours per day for feedback and delaying every release by at least one sprint.',
    fullAction: 'I analysed bottlenecks using BuildKite traces, introduced incremental Docker layer caching, parallelised test suites across 8 agents, and migrated the artifact store from S3 to a local registry.',
    fullResult: 'Build time dropped from 45 min to 8 min (–82%), saving the 12-person team ~1.5 hours of idle time per day and allowing us to ship to production daily instead of weekly.',
    eliteTitle: 'ELITE Framework',
    eliteSubtitle: 'Experience · Leadership · Impact · Transformation · Excellence',
    eliteIntro: 'The ELITE framework is a classification layer applied on top of each CAR achievement. It tells a reader which dimension of consulting value this achievement demonstrates. Senior consultants are expected to show a portfolio across all five categories. Tagging each achievement helps you and the reader quickly see whether your resume is balanced or overweight in one area.',
    expTitle: 'Experience',
    expDesc: 'Deep domain or technical expertise applied to solve a hard problem. Use this tag when the achievement required specialised knowledge that took years to acquire — architecture decisions, rare technology stacks, regulated industries, complex integrations.',
    expExample: '"Designed a multi-region active-active Cosmos DB topology for a banking client, leveraging deep knowledge of conflict resolution and consistency models to meet a 99.999% SLA requirement."',
    leadTitle: 'Leadership',
    leadDesc: 'Influencing people, teams, or organisations beyond your formal authority. Use this tag when you drove alignment, mentored others, led a team through uncertainty, built cross-functional consensus, or shaped organisational behaviour.',
    leadExample: '"Led a 9-person cross-functional squad across 3 time zones during a critical migration, facilitating daily stand-ups and escalation paths that kept the project on schedule despite two key engineers being replaced mid-engagement."',
    impTitle: 'Impact',
    impDesc: 'Quantifiable business or customer outcomes — revenue, cost, time, risk, NPS, user growth. Use this tag when the result is primarily measured in business metrics rather than technical ones. The bigger and more concrete the number, the stronger this tag.',
    impExample: '"Optimised the checkout flow for an e-commerce client, reducing cart abandonment by 23% and generating an additional €1.4 M in annual revenue within 6 months of launch."',
    transTitle: 'Transformation',
    transDesc: "Changing how a team, process, or organisation works — not just improving a metric. Use this tag when you introduced a new way of working, replaced a legacy system, shifted a culture, or enabled a capability that didn't exist before.",
    transExample: '"Introduced event-driven architecture to replace a monolithic batch-processing system, enabling real-time data processing and reducing the time-to-insight for analysts from overnight to under 30 seconds."',
    excelTitle: 'Excellence',
    excelDesc: "Going significantly above expectations in quality, thoroughness, or craft. Use this tag for achievements that demonstrate unusually high standards: zero-defect deliverables, exceptional client satisfaction scores, awards, or solutions that became internal reference implementations.",
    excelExample: '"Delivered an accessibility audit and remediation for a public-sector portal that achieved a 100/100 Lighthouse score — the first project in the firm\'s history to meet full WCAG 2.1 AA compliance at launch."',
    howTitle: 'How to Use Both Together',
    step1Title: 'Pick an achievement.',
    step1: 'Think of a moment where you made a real difference — a problem solved, a project delivered, a process improved.',
    step2Title: 'Write the Challenge.',
    step2: 'Set the scene with specifics. What was broken, missing, or at risk? What were the stakes?',
    step3Title: 'Write the Action.',
    step3: 'Focus on your contribution. Use strong verbs. Include decisions, tools, and approaches you chose.',
    step4Title: 'Write the Result.',
    step4: "Quantify the outcome. If you don't have exact numbers, estimate conservatively or express relative improvement.",
    step5Title: 'Assign an ELITE tag.',
    step5: 'Ask yourself: what is the primary consulting value this achievement demonstrates? Pick the single best-fitting category.',
    step6Title: 'Review your balance.',
    step6: 'Aim for a spread across all five ELITE categories across your resume. A resume with only "Impact" tags may signal a narrow profile.',
    exampleLabel: 'Example',
  },
  de: {
    title: 'Framework-Leitfaden',
    carTitle: 'CAR-Framework',
    carSubtitle: 'Challenge · Action · Result',
    carIntro: 'Das CAR-Framework ist eine strukturierte Methode zur Beschreibung beruflicher Leistungen. Es zwingt Sie, über vage Aufgabenbeschreibungen hinauszugehen und jede Errungenschaft als Mini-Erzählung darzustellen: Was war das Problem, was haben Sie konkret dagegen unternommen und was hat sich messbar verbessert? Recruiter und Hiring Manager suchen gezielt nach diesem Muster, weil es Wirkung belegt statt nur Anwesenheit.',
    challengeTitle: 'C — Challenge (Herausforderung)',
    challengeDesc: 'Beschreiben Sie das Problem, die Einschränkung, die Lücke oder die Chance, die eine Handlung erforderte. Seien Sie konkret: Zahlen, Kontext und Einsatz machen die Herausforderung greifbar. Vermeiden Sie allgemeine Phrasen wie „wir hatten Performance-Probleme" – quantifizieren Sie den Schmerz.',
    challengeExample: '„Unsere CI/CD-Pipeline benötigte im Schnitt 45 Minuten pro Build, wodurch Entwickler täglich über 2 Stunden auf Feedback warteten und jedes Release um mindestens einen Sprint verzögert wurde."',
    actionTitle: 'A — Action (Maßnahme)',
    actionDesc: 'Beschreiben Sie, was Sie persönlich getan haben – nicht das Team, nicht das Projekt. Verwenden Sie Verben in der ersten Person: entworfen, implementiert, verhandelt, automatisiert, geleitet. Nennen Sie die eingesetzten Werkzeuge, Methoden und getroffenen Entscheidungen. Hier werden Ihre Fähigkeiten sichtbar.',
    actionExample: '„Ich analysierte Engpässe mit BuildKite-Traces, führte inkrementelles Docker-Layer-Caching ein, parallelisierte Test-Suites auf 8 Agenten und migrierte den Artifact-Store von S3 in eine lokale Registry."',
    resultTitle: 'R — Result (Ergebnis)',
    resultDesc: 'Nennen Sie das messbare Ergebnis. Quantifizieren Sie, wo immer möglich: Prozentzahlen, gesparte Zeit, gesparte Kosten, freigeschaltete Nutzer, reduzierte Fehlerquoten. Wenn genaue Zahlen vertraulich sind, verwenden Sie relative Angaben („um ca. 60 % reduziert") oder beschreiben Sie den Geschäftsnutzen.',
    resultExample: '„Die Build-Zeit sank von 45 auf 8 Minuten (–82 %), was dem 12-köpfigen Team täglich ca. 1,5 Stunden Leerlauf ersparte und tägliche statt wöchentlicher Releases in Produktion ermöglichte."',
    fullExampleLabel: 'Vollständiges CAR-Beispiel',
    fullChallenge: 'Unsere CI/CD-Pipeline benötigte im Schnitt 45 Minuten pro Build, wodurch Entwickler täglich über 2 Stunden auf Feedback warteten und jedes Release um mindestens einen Sprint verzögert wurde.',
    fullAction: 'Ich analysierte Engpässe mit BuildKite-Traces, führte inkrementelles Docker-Layer-Caching ein, parallelisierte Test-Suites auf 8 Agenten und migrierte den Artifact-Store von S3 in eine lokale Registry.',
    fullResult: 'Die Build-Zeit sank von 45 auf 8 Minuten (–82 %), was dem 12-köpfigen Team täglich ca. 1,5 Stunden Leerlauf ersparte und tägliche statt wöchentlicher Releases in Produktion ermöglichte.',
    eliteTitle: 'ELITE-Framework',
    eliteSubtitle: 'Experience · Leadership · Impact · Transformation · Excellence',
    eliteIntro: 'Das ELITE-Framework ist eine Klassifizierungsebene, die auf jedes CAR-Achievement aufgesetzt wird. Es zeigt dem Leser, welche Dimension des Beratungswertes diese Leistung demonstriert. Von Senior-Consultants wird erwartet, dass sie ein Portfolio über alle fünf Kategorien vorweisen. Das Taggen jeder Leistung hilft Ihnen und dem Leser schnell zu erkennen, ob Ihr Lebenslauf ausgewogen ist oder eine Kategorie überwiegt.',
    expTitle: 'Experience (Erfahrung)',
    expDesc: 'Tiefes fachliches oder technisches Expertenwissen, das zur Lösung eines schwierigen Problems eingesetzt wird. Verwenden Sie dieses Tag, wenn die Leistung spezialisiertes Wissen erforderte, das jahrelange Erfahrung voraussetzte – Architekturentscheidungen, seltene Technologie-Stacks, regulierte Branchen, komplexe Integrationen.',
    expExample: '„Entwurf einer Multi-Region Active-Active Cosmos DB-Topologie für einen Bankkunden – unter Nutzung tiefgreifender Kenntnisse zu Konfliktauflösung und Konsistenzmodellen zur Erfüllung einer 99,999 % SLA-Anforderung."',
    leadTitle: 'Leadership (Führung)',
    leadDesc: 'Menschen, Teams oder Organisationen über die formelle Autorität hinaus beeinflussen. Verwenden Sie dieses Tag, wenn Sie Ausrichtung herbeigeführt, andere mentoriert, ein Team durch Unsicherheit geführt, funktionsübergreifenden Konsens aufgebaut oder organisationales Verhalten geprägt haben.',
    leadExample: '„Leitung eines 9-köpfigen cross-funktionalen Teams über 3 Zeitzonen während einer kritischen Migration – tägliche Stand-ups und Eskalationspfade sicherten den Zeitplan trotz des Austauschs von zwei Schlüsselingenieuren."',
    impTitle: 'Impact (Wirkung)',
    impDesc: 'Quantifizierbare Geschäfts- oder Kundenergebnisse – Umsatz, Kosten, Zeit, Risiko, NPS, Nutzerwachstum. Verwenden Sie dieses Tag, wenn das Ergebnis primär in Geschäftskennzahlen gemessen wird. Je größer und konkreter die Zahl, desto stärker dieses Tag.',
    impExample: '„Optimierung des Checkout-Flows für einen E-Commerce-Kunden: Warenkorbabbrüche um 23 % reduziert, was innerhalb von 6 Monaten nach dem Launch zusätzliche 1,4 Mio. € Jahresumsatz generierte."',
    transTitle: 'Transformation',
    transDesc: 'Die Arbeitsweise eines Teams, Prozesses oder einer Organisation verändern – nicht nur eine Kennzahl verbessern. Verwenden Sie dieses Tag, wenn Sie eine neue Arbeitsweise eingeführt, ein Legacy-System abgelöst, eine Kultur verschoben oder eine zuvor nicht vorhandene Fähigkeit ermöglicht haben.',
    transExample: '„Einführung einer Event-Driven-Architektur als Ersatz für ein monolithisches Batch-Processing-System – Echtzeit-Datenverarbeitung ermöglicht, Time-to-Insight für Analysten von über Nacht auf unter 30 Sekunden reduziert."',
    excelTitle: 'Excellence (Exzellenz)',
    excelDesc: 'Deutlich über die Erwartungen hinausgehen – in Qualität, Gründlichkeit oder Handwerk. Verwenden Sie dieses Tag für Leistungen, die außergewöhnlich hohe Standards demonstrieren: fehlerfreie Deliverables, herausragende Kundenzufriedenheitswerte, Auszeichnungen oder Lösungen, die als interne Referenzimplementierungen dienen.',
    excelExample: '„Barrierefreiheits-Audit und Remediation für ein Behördenportal mit einem Lighthouse-Score von 100/100 – erstes Projekt in der Unternehmensgeschichte, das die vollständige WCAG 2.1 AA-Konformität beim Launch erfüllte."',
    howTitle: 'So nutzen Sie beide Frameworks gemeinsam',
    step1Title: 'Wählen Sie eine Leistung.',
    step1: 'Denken Sie an einen Moment, in dem Sie einen echten Unterschied gemacht haben – ein gelöstes Problem, ein abgeliefertes Projekt, ein verbesserter Prozess.',
    step2Title: 'Schreiben Sie die Challenge.',
    step2: 'Schildern Sie den Kontext mit konkreten Details. Was war kaputt, fehlte oder stand auf dem Spiel?',
    step3Title: 'Schreiben Sie die Action.',
    step3: 'Fokussieren Sie auf Ihren persönlichen Beitrag. Verwenden Sie starke Verben. Nennen Sie die Entscheidungen, Werkzeuge und Ansätze, die Sie gewählt haben.',
    step4Title: 'Schreiben Sie das Result.',
    step4: 'Quantifizieren Sie das Ergebnis. Wenn Sie keine genauen Zahlen haben, schätzen Sie konservativ oder beschreiben Sie die relative Verbesserung.',
    step5Title: 'Vergeben Sie ein ELITE-Tag.',
    step5: 'Fragen Sie sich: Welchen primären Beratungswert demonstriert diese Leistung? Wählen Sie die am besten passende Kategorie.',
    step6Title: 'Überprüfen Sie die Balance.',
    step6: 'Streben Sie eine Verteilung über alle fünf ELITE-Kategorien im gesamten Lebenslauf an. Ein Lebenslauf mit ausschließlich „Impact"-Tags kann auf ein eingeschränktes Profil hinweisen.',
    exampleLabel: 'Beispiel',
  },
} as const;

export default function HelpPage({ onClose, language }: Props) {
  const s = t[language];
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{s.title}</h1>
        <button
          onClick={onClose}
          aria-label="Close help"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
      </div>

      {/* CAR Framework */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{s.carTitle}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{s.carSubtitle}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{s.carIntro}</p>

        <div className="space-y-6">
          {/* Challenge */}
          <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-5">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">{s.challengeTitle}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{s.challengeDesc}</p>
            <div className="rounded-md bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900 p-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{s.exampleLabel}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">{s.challengeExample}</p>
            </div>
          </div>

          {/* Action */}
          <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-5">
            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">{s.actionTitle}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{s.actionDesc}</p>
            <div className="rounded-md bg-white dark:bg-gray-800 border border-green-100 dark:border-green-900 p-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{s.exampleLabel}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">{s.actionExample}</p>
            </div>
          </div>

          {/* Result */}
          <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 p-5">
            <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">{s.resultTitle}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{s.resultDesc}</p>
            <div className="rounded-md bg-white dark:bg-gray-800 border border-orange-100 dark:border-orange-900 p-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{s.exampleLabel}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">{s.resultExample}</p>
            </div>
          </div>
        </div>

        {/* Full CAR example */}
        <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-5">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{s.fullExampleLabel}</p>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p><span className="font-semibold text-blue-700 dark:text-blue-400">{s.challengeTitle}: </span>{s.fullChallenge}</p>
            <p><span className="font-semibold text-green-700 dark:text-green-400">{s.actionTitle}: </span>{s.fullAction}</p>
            <p><span className="font-semibold text-orange-700 dark:text-orange-400">{s.resultTitle}: </span>{s.fullResult}</p>
          </div>
        </div>
      </section>

      <hr className="border-gray-200 dark:border-gray-700 mb-12" />

      {/* ELITE Framework */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{s.eliteTitle}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{s.eliteSubtitle}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{s.eliteIntro}</p>

        <div className="space-y-5">
          {/* Experience */}
          <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-sm font-bold">E</span>
              <h3 className="font-semibold text-blue-800 dark:text-blue-300">{s.expTitle}</h3>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{s.expDesc}</p>
            <div className="rounded-md bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900 p-3 text-sm text-gray-700 dark:text-gray-300 italic">{s.expExample}</div>
          </div>

          {/* Leadership */}
          <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 text-sm font-bold">L</span>
              <h3 className="font-semibold text-purple-800 dark:text-purple-300">{s.leadTitle}</h3>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{s.leadDesc}</p>
            <div className="rounded-md bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-900 p-3 text-sm text-gray-700 dark:text-gray-300 italic">{s.leadExample}</div>
          </div>

          {/* Impact */}
          <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-sm font-bold">I</span>
              <h3 className="font-semibold text-green-800 dark:text-green-300">{s.impTitle}</h3>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{s.impDesc}</p>
            <div className="rounded-md bg-white dark:bg-gray-800 border border-green-100 dark:border-green-900 p-3 text-sm text-gray-700 dark:text-gray-300 italic">{s.impExample}</div>
          </div>

          {/* Transformation */}
          <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 text-sm font-bold">T</span>
              <h3 className="font-semibold text-orange-800 dark:text-orange-300">{s.transTitle}</h3>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{s.transDesc}</p>
            <div className="rounded-md bg-white dark:bg-gray-800 border border-orange-100 dark:border-orange-900 p-3 text-sm text-gray-700 dark:text-gray-300 italic">{s.transExample}</div>
          </div>

          {/* Excellence */}
          <div className="rounded-lg border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200 text-sm font-bold">E</span>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">{s.excelTitle}</h3>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{s.excelDesc}</p>
            <div className="rounded-md bg-white dark:bg-gray-800 border border-yellow-100 dark:border-yellow-800 p-3 text-sm text-gray-700 dark:text-gray-300 italic">{s.excelExample}</div>
          </div>
        </div>
      </section>

      <hr className="border-gray-200 dark:border-gray-700 mb-12" />

      {/* How to use */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{s.howTitle}</h2>
        <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          {([
            [s.step1Title, s.step1],
            [s.step2Title, s.step2],
            [s.step3Title, s.step3],
            [s.step4Title, s.step4],
            [s.step5Title, s.step5],
            [s.step6Title, s.step6],
          ] as [string, string][]).map(([title, body], i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span><strong>{title}</strong> {body}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
