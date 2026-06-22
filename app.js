/**
 * PulseWire — Autonomous World News Dashboard
 * Single-file vanilla JS application.
 */

(function () {
  'use strict';

  // =========================================================
  // Configuration & State
  // =========================================================

  const CONFIG = {
    apiBase: '/api/news',
    refreshEndpoint: '/api/refresh',
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    debounceDelay: 300,
    pageSize: 20,
    categories: ['all', 'business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'],
    categoryLabels: {
      all: 'Alle',
      business: 'Wirtschaft',
      entertainment: 'Unterhaltung',
      general: 'Allgemein',
      health: 'Gesundheit',
      science: 'Wissenschaft',
      sports: 'Sport',
      technology: 'Technologie',
    },
  };

  const state = {
    articles: [],
    filtered: [],
    favorites: new Set(),
    category: 'all',
    query: '',
    view: 'grid',
    loading: true,
    error: null,
    useFallback: false,
    darkMode: localStorage.getItem('pulsewire_dark_mode') === 'true',
    lastUpdated: null,
    refreshTimer: null,
    justLoaded: true,
    prefersReducedMotion: false,
  };

  // =========================================================
  // Demo Data (realistic, curated fallback)
  // =========================================================

  const DEMO_IMAGES = {
    business: [
      'https://images.unsplash.com/photo-1611974765270-ca1258634369?w=800&q=80',
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
    ],
    entertainment: [
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80',
      'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=800&q=80',
      'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80',
    ],
    general: [
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80',
      'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80',
    ],
    health: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&q=80',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
    ],
    science: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80',
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
    ],
    sports: [
      'https://images.unsplash.com/photo-1461896836934-ff4962ba0148?w=800&q=80',
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
    ],
    technology: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
    ],
  };

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';

  const DEMO_HEADLINES = {
    business: [
      {
        title: 'EZB senkt Leitzins überraschend um 25 Basispunkte',
        desc: 'Die Europäische Zentralbank reagiert mit einer vorgezogenen Zinssenkung auf die schwächelnde Konjunktur in der Eurozone und will die Kreditvergabe ankurbeln.',
        content: 'Im überraschendsten Schritt seit der letzten Finanzkrise senkt die Europäische Zentralbank den Leitzins um 25 Basispunkte. Die Entscheidung fiel einstimmig im Rat der EZB und soll die ohnehin schwächelnde Kreditnachfrage in der Eurozone wieder beleben. Wirtschaftsweise hatten zuletzt mit einer Zinspause gerechnet, doch schwache Konjunkturdaten aus Deutschland und Frankreich trieben Präsidentin Christine Lagarde offenbar zu einer vorsorglichen Lockerung der Geldpolitik. Kritiker warnen vor einer zu expansiven Politik, da die Inflation in vielen Mitgliedstaaten weiterhin über dem Zielwert von zwei Prozent liegt. Die Märkte reagierten positiv: Der Euro gab leicht nach, während europäische Leitindizes zulegten. Analysten gehen davon aus, dass weitere Zinssenkungen folgen könnten, falls die Konjunktur nicht bald an Fahrt gewinnt. Verbraucher können mit günstigeren Krediten rechnen, Sparern drohen jedoch weiterhin Mini-Zinsen.'
      },
      {
        title: 'GlobalTech kündigt Milliardeninvestition in europäische Chipfabriken an',
        desc: 'Der Halbleiterriese will bis 2027 drei neue Fertigungsstätten in Deutschland und Frankreich errichten und tausende Arbeitsplätze schaffen.',
        content: 'GlobalTech, einer der weltweit führenden Halbleiterhersteller, hat eine historische Investition für Europa angekündigt. Bis 2027 sollen drei hochmoderne Chipfabriken in Deutschland und Frankreich entstehen, mit einem Gesamtvolumen von über 30 Milliarden Euro. Das Unternehmen verspricht die Schaffung von bis zu 15.000 direkten Arbeitsplätzen und weitere Zehntausende indirekte Jobs in der Lieferkette. Die EU-Kommission begrüßte den Schritt als Meilenstein für die technologische Souveränität Europas. Die Fabriken sollen vor allem fortschrittliche Prozessoren für Künstliche Intelligenz, Elektromobilität und erneuerbare Energien produzieren. Umweltverbände forderten allerdings strenge Auflagen für den Wasser- und Energieverbrauch der Anlagen. Die ersten Spatenstiche sind für Anfang nächsten Jahres geplant.'
      },
      {
        title: 'Ölpreise steigen nach neuen Spannungen im Nahen Osten',
        desc: 'Rohöl der Benchmark-Sorte Brent kostet erstmals seit Monaten wieder über 90 US-Dollar pro Barrel, was Inflationssorgen befeuert.',
        content: 'Die Ölmärkte reagieren nervös auf die jüngsten Spannungen im Nahen Osten. Die Brent-Sorte überschritt erstmals seit mehreren Monaten wieder die Marke von 90 US-Dollar pro Barrel, während auch das US-Leichtöl WTI deutlich zulegte. Anleger fürchten, dass Konflikte in der Region zu Engpässen bei der Ölversorgung führen könnten. Mehrere große Fördernationen riefen zur Deeskalation auf, gleichzeitig wurden strategische Ölreserven in den USA und Asien geprüft. Die OPEC+ signalisierte bislang keine schnelle Reaktion auf die Preisbewegung. Für Verbraucher könnten höhere Ölpreise erneut teurere Kraftstoffe und Energiekosten bedeuten, was die ohnehin hohe Inflation weiter befeuern würde. Experten warnen vor einer neuen Runde Preissteigerungen in der Industrie.'
      },
      {
        title: 'Start-up-Boom in Berlin: Risikokapital erreicht Rekordhoch',
        desc: 'Deutsche Tech-Gründer haben im zweiten Quartal mehr Venture-Capital eingeworben als je zuvor, besonders in KI und Klimatech.',
        content: 'Berlin festigt seinen Ruf als europäische Start-up-Hauptstadt. Im zweiten Quartal flossen mehr Venture-Capital-Investitionen in deutsche Tech-Gründer als je zuvor in einem vergleichbaren Zeitraum. Besonders stark nachgefragt waren Unternehmen aus den Bereichen Künstliche Intelligenz, Klimatech und Gesundheit. Internationale Fonds aus den USA, Asien und dem Nahen Osten beteiligten sich an mehreren Riesenrunden. Politiker feierten den Trend als Erfolg der deutschen Innovationspolitik, warnten aber zugleich vor Bürokratie, die junge Unternehmen weiterhin bremsen könne. Kritiker bemängeln zudem, dass viele Start-ups hohe Verluste schreiben und ihre Geschäftsmodelle noch nicht profitabel sind. Dennoch strahlt der Sektor Optimismus aus.'
      },
    ],
    entertainment: [
      {
        title: 'Internationale Filmfestspiele prämieren überraschenden Gewinner',
        desc: 'Ein Debüt aus Südkorea erhält die Goldene Palme und sorgt für Diskussionen über die Zukunft des Arthouse-Kinos.',
        content: 'Die Internationalen Filmfestspiele haben mit der Verleihung der Goldenen Palme an ein südkoreanisches Debüt für eine Sensation gesorgt. Der melancholische Familiendrama, der von einer zerbrochenen Großfamilie in Seoul erzählt, überzeugte die Jury durch seine visuelle Poesie und soziale Tiefe. Filmkritiker sprechen bereits von einem Wendepunkt für das Arthouse-Kino, das zuletzt unter dem Druck von Streaming-Plattformen und Blockbustern gelitten hatte. Regisseurin Park Min-ju nahm den Preis sichtlich bewegt entgegen und widmete ihn allen jungen Filmemachern weltweit. Diskutiert wurde auch die Zukunft der großen Festivals angesichts sinkender Budgets und fragmentierter Zuschauerschaft. Die nächsten Monate werden zeigen, ob der Film auch außerhalb des Festivalzirkus ein Publikum findet.'
      },
      {
        title: 'Streamingdienst kündigt Adaption des Jahrhundertbestsellers an',
        desc: 'Die aufwendige Serie wird in acht Sprachen produziert und soll Ende nächsten Jahres starten.',
        content: 'Einer der größten Streamingdienste hat die Serienadaption eines weltweit gefeierten Bestsellers angekündigt. Die Produktion soll in acht Sprachen synchronisiert und in mehreren Ländern gedreht werden, was das Projekt zu einem der teuersten Serien der vergangenen Jahre macht. Internationale Stars wurden für die Hauptrollen verpflichtet, während das Drehbuch vom Autor des Originalromans persönlich überwacht wird. Fans reagierten auf die Ankündigung mit Spannung und Skepsis zugleich, da Buchverfilmungen oft an den hohen Erwartungen scheitern. Der Start ist für Ende nächsten Jahres geplant, begleitet von einer globalen Marketingkampagne. Analysten erwarten, dass die Serie Millionen neue Abonnenten bringen könnte.'
      },
      {
        title: 'Pop-Ikone verkündet Welttournee mit Rekordbudget',
        desc: 'Über 50 Arena-Shows in fünf Kontinenten sind geplant; Tickets sollen bereits nächste Woche in den Verkauf gehen.',
        content: 'Eine der bekanntesten Pop-Ikonen der Gegenwart hat eine globale Welttournee mit über 50 Arena-Shows angekündigt. Die Tournee soll fünf Kontinente umfassen und gilt als eine der aufwendigsten Produktionen der jüngsten Musikgeschichte. Das Budget für Bühnenbild, Licht und Choreografie soll in die dreistelligen Millionen gehen. Tickets gehen bereits nächste Woche in den Vorverkauf, wobei Fanclubs bereits jetzt auf Serverprobleme und Wartelisten vorbereitet sind. Kritiker bezweifeln, ob die Tournee angesichts hoher Kosten und logistischer Herausforderungen profitabel sein wird. Fans sind hingegen begeistert und feiern die Rückkehr der Künstlerin auf die Bühne.'
      },
    ],
    general: [
      {
        title: 'Weltklimarat warnt vor irreversiblen Kipppunkten',
        desc: 'Ein neuer Sonderbericht fordert sofortige globale Emissionsreduktionen, um gefährliche Rückkopplungseffekte zu vermeiden.',
        content: 'Der Weltklimarat hat einen neuen Sonderbericht veröffentlicht, der eindringlich vor irreversiblen Kipppunkten im Klimasystem warnt. Demnach könnten Permafrostböden, Eisschilde und Korallenriffe bereits in den kommenden Jahrzehnten Schaden nehmen, der sich nicht mehr rückgängig machen lässt. Die Wissenschaftler fordern eine sofortige Halbierung der globalen Treibhausgasemissionen bis 2030 und Klimaneutralität bis 2040. Regierungen weltweit reagierten unterschiedlich auf den Bericht: Während einige Staaten verschärfte Klimaziele ankündigten, wiesen andere die Empfehlungen als wirtschaftlich nicht umsetzbar zurück. Umweltaktivisten kündigten neue Protestaktionen an. Der Bericht wird voraussichtlich eine zentrale Rolle bei der nächsten UN-Klimakonferenz spielen.'
      },
      {
        title: 'Historischer Gipfel zur Atomabrüstung beginnt in Genf',
        desc: 'Vertreter aus über 40 Staaten beraten über einen neuen Rahmenvertrag zur nuklearen Rüstungskontrolle.',
        content: 'In Genf hat ein historischer Gipfel zur Atomabrüstung begonnen, an dem Vertreter aus über 40 Staaten teilnehmen. Ziel ist ein neuer Rahmenvertrag zur nuklearen Rüstungskontrolle, der die bestehenden Abkommen ersetzen oder ergänzen soll. Die Verhandlungen werden von Spannungen zwischen den großen Atommächten begleitet, die unterschiedliche Vorstellungen von Abrüstungsschritten haben. Nichtstaatliche Organisationen forderten transparente Inspektionen und eine schrittweise Reduzierung der weltweit noch immer mehr als 12.000 Atomsprengköpfe. Experten sind skeptisch, ob der Gipfel zu konkreten Ergebnissen führen wird, begrüßen aber das Wiederaufleben des diplomatischen Dialogs. Die ersten Verhandlungstage sollen vor allem Vertrauensbildende Maßnahmen behandeln.'
      },
      {
        title: 'Großstadt testet kostenlosen Nahverkehr für alle Einwohner',
        desc: 'Das einjährige Pilotprojekt soll Verkehrswende und soziale Teilhabe gleichermaßen stärken.',
        content: 'Eine europäische Großstadt startet ein einjähriges Pilotprojekt für kostenlosen öffentlichen Nahverkehr. Alle Einwohner sollen Busse, Bahnen und U-Bahnen ohne Ticket nutzen können, was als Experiment für mehr Verkehrswende und soziale Teilhabe gedacht ist. Befürworter hoffen auf eine deutliche Reduzierung von Autofahrten und damit verbundene Entlastungen für Luftqualität und Lärm. Kritiker bemängeln die hohen Kosten und befürchten Überfüllungen im Berufsverkehr. Finanziert wird das Projekt aus einem Mix aus Stadthaushalt, Umweltabgaben und Fördermitteln. Während der Testphase werden wissenschaftlich begleitend Verkehrsdaten, Umweltauswirkungen und Akzeptanz erhoben. Andere Städte beobachten das Experiment mit großem Interesse.'
      },
    ],
    health: [
      {
        title: 'Neue Studie: Schlafqualität stärker mit Immunität verknüpft als gedacht',
        desc: 'Forschende entdecken einen Mechanismus, der unzureichenden Schlaf mit verminderter Immunantwort in Verbindung bringt.',
        content: 'Eine internationale Forschergruppe hat einen bisher unbekannten Mechanismus entdeckt, der Schlafmangel mit einer geschwächten Immunantwort verbindet. Demnach werden während des Schlafs bestimmte Botenstoffe freigesetzt, die die Produktion von Immunzellen regulieren. Wer regelmäßig zu wenig schläft, bildet demnach weniger effektive Abwehrzellen und ist anfälliger für Infektionen. Die Studie, die über mehrere Jahre an Tausenden Probanden durchgeführt wurde, könnte nach Ansicht von Experten die Bedeutung ausreichenden Schlafs neu definieren. Schlafmediziner empfehlen Erwachsenen weiterhin sieben bis neun Stunden Schlaf pro Nacht. Arbeitgeber und Gesundheitspolitiker werden aufgefordert, chronischen Schlafmangel stärker als Gesundheitsrisiko zu behandeln.'
      },
      {
        title: 'WHO empfiehlt aktualisierten Impfstoff gegen neue Virusvariante',
        desc: 'Die überarbeitete Formulierung soll in den kommenden Wochen in Europa und Nordamerika verfügbar sein.',
        content: 'Die Weltgesundheitsorganisation hat die Verwendung eines aktualisierten Impfstoffs gegen eine neu aufkommende Virusvariante empfohlen. Die überarbeitete Formulierung soll besser gegen die jüngsten Mutationen wirken und in den kommenden Wochen in Europa und Nordamerika verfügbar sein. Gesundheitsbehörden in mehreren Ländern bereiten bereits Impfkampagnen für Risikogruppen vor. Kritiker bemängeln, dass Impfstoffe für ärmere Länder weiterhin knapp bleiben könnten, während reiche Staaten bereits die zweite Auffrischung starten. Die WHO betonte, dass weltweite Impfgerechtigkeit entscheidend bleibe, um weitere Varianten zu verhindern. Parallel werden weiterhin nicht-pharmazeutische Maßnahmen wie Händehygiene und Lüften empfohlen.'
      },
      {
        title: 'Weltweit erste Roboter-Herzoperation erfolgreich abgeschlossen',
        desc: 'Ein internationales Ärzteteam setzte bei einem komplexen Eingriff erstmals vollständig autonome Instrumente ein.',
        content: 'Ein internationales Ärzteteam hat die weltweit erste vollständig roboterassistierte Herzoperation erfolgreich durchgeführt. Dabei wurden autonome chirurgische Instrumente eingesetzt, die von menschlichen Chirurgen überwacht, aber nicht direkt gesteuert wurden. Der Patient soll sich nach dem Eingriff schnell erholen und sich bereits in stabilem Zustand befinden. Medizinische Experten bezeichnen den Durchbruch als Meilenstein für die präzisionschirurgische Medizin. Kritiker warnen jedoch vor ethischen und rechtlichen Fragen, wenn Maschinen eigenständig in den menschlichen Körper eingreifen. In den kommenden Jahren sollen weitere klinische Studien die Sicherheit und Wirksamkeit des Verfahrens untersuchen.'
      },
    ],
    science: [
      {
        title: 'Mars-Rover findet organische Moleküle in alter Flussschlucht',
        desc: 'Die Entdeckung könnte neue Hinweise auf frühere habituelle Bedingungen auf dem Roten Planeten liefern.',
        content: 'Ein Mars-Rover hat in einer alten Flussschlucht organische Moleküle entdeckt, die möglicherweise auf frühere Lebensbedingungen auf dem Roten Planeten hindeuten. Die Moleküle wurden in Sedimentgestein gefunden, das vor Milliarden Jahren von fließendem Wasser abgelagert wurde. Wissenschaftler betonen vorsichtig, dass organische Verbindungen auch durch nicht-biologische Prozesse entstehen können. Dennoch gilt die Entdeckung als einer der vielversprechendsten Hinweise seit Jahren. Die nächsten Analysen sollen klären, ob die Moleküle bestimmte Isotopenmuster aufweisen, die auf biologischen Ursprung schließen lassen. Raumfahrbehörden planen bereits Missionen, um Proben zur Erde zurückzubringen.'
      },
      {
        title: 'Forscher melden Durchbruch bei der Kernfusion',
        desc: 'Ein Experiment in Südkorea erzielte einen Netto-Energiegewinn über einen Zeitraum von mehreren Minuten.',
        content: 'Forscher in Südkorea haben einen weiteren Meilenstein auf dem Weg zur Nutzung der Kernfusion als Energiequelle gemeldet. In einem Experiment gelang es, über mehrere Minuten hinweg einen Netto-Energiegewinn zu erzielen, also mehr Energie zu produzieren als für den Betrieb des Reaktors aufgewendet wurde. Bisher waren solche Ergebnisse nur für Sekundenbruchteile möglich. Experten sprechen von einem entscheidenden Schritt hin zur technischen Reife der Fusionsenergie. Dennoch dürfte es noch Jahrzehnte dauern, bis kommerzielle Fusionskraftwerke Strom ins Netz einspeisen. Kritiker verweisen auf die enormen Kosten und die ungelösten Materialfragen bei den extremen Temperaturen im Reaktor.'
      },
      {
        title: 'Neues Teleskop liefert bislang schärfste Bilder einer fernen Galaxie',
        desc: 'Die Aufnahmen zeigen Sternentstehungsgebiete in einer Auflösung, die bislang als unmöglich galt.',
        content: 'Ein neues Weltraumteleskop hat die bislang schärfsten Bilder einer fernen Galaxie geliefert. Die Aufnahmen zeigen Sternentstehungsgebiete und Staubstrukturen in einer Auflösung, die Astronomen bislang für unmöglich hielten. Die Daten könnten helfen, besser zu verstehen, wie Galaxien in den ersten Milliarden Jahren nach dem Urknall entstanden sind. Wissenschaftler weltweit haben bereits Zugriff auf die Rohdaten und arbeiten an ersten Veröffentlichungen. Das Teleskop wurde in einem internationalen Konsortium gebaut und gilt als Nachfolger mehrerer erfolgreicher Vorgängermissionen. In den kommenden Monaten sollen weitere Zielobjekte beobachtet werden, darunter Exoplaneten und Schwarze Löcher.'
      },
    ],
    sports: [
      {
        title: 'Nationalmannschaft zieht nach dramatischem Halbfinale ins Endspiel ein',
        desc: 'Ein Treffer in der Nachspielzeit sichert den Einzug ins Finale des internationalen Turniers.',
        content: 'Die Nationalmannschaft steht nach einem dramatischen Halbfinalspiel im Finale des internationalen Turniers. Ein Treffer in der fünften Minute der Nachspielzeit entschied das eng umkämpfte Match zugunsten des Teams, das damit erstmals seit Jahren wieder um den Titel spielen wird. Trainer und Spieler feierten ausgelassen auf dem Platz, während die Fans im Stadion eine Gänsehautatmosphäre erlebten. Der Gegner im Finale wird am Wochenende im zweiten Halbfinale ermittelt. Experten lobten die kämpferische Leistung und die taktische Disziplin der Mannschaft. Die Finalniederlassung der Mannschaft wurde bereits mit Jubel und Feierlichkeiten empfangen.'
      },
      {
        title: 'Weltrekord über 100 Meter bei Leichtathletik-Meeting gebrochen',
        desc: 'Der Sprinter lief die Strecke in einer Zeit, die Experten als neuen Meilenstein feiern.',
        content: 'Bei einem Leichtathletik-Meeting wurde der Weltrekord über 100 Meter gebrochen. Der Sprinter lief die Strecke in einer Zeit, die Experten als neuen Meilenstein in der Geschichte der Leichtathletik feiern. Die bisherige Bestmarke, die seit über einem Jahrzehnt unangefochten war, wurde damit um wenige Hundertstelsekunden unterboten. Leistungsphysiologen wundern sich über die kontinuierliche Weiterentwicklung der Spitzensportler trotz scheinbar physischer Grenzen. Der Athlet selbst zeigte sich nach dem Rennen überwältigt und sprach von einem Lebenstraum. Der Internationale Leichtathletikverband muss den Rekord noch offiziell bestätigen, was in den kommenden Wochen erfolgen soll.'
      },
      {
        title: 'Tennis-Star gewinnt erstes Grand-Slam-Turnier der Karriere',
        desc: 'Im Finale bezwang die 21-Jährige die Weltranglistenerste in drei Sätzen.',
        content: 'Eine 21-jährige Tennisspielerin hat ihr erstes Grand-Slam-Turnier gewonnen. Im Finale bezwang sie die Weltranglistenerste in einem dramatischen Dreisatzmatch, das als einer der besten Finalkämpfe der letzten Jahre in die Geschichte eingehen könnte. Die junge Athletin zeigte Nervenstärke und kämpfte sich nach einem Satz Rückstand zurück. Nach dem Match fielen ihr die Tränen der Freude, während sie den Pokal in die Höhe stemmte. Experten prophezeien ihr eine große Karriere und sehen sie als neue dominierende Kraft im Damen-Tennis. Die Weltranglistenerste gratulierte fair und kündigte an, stärker zurückzukommen.'
      },
    ],
    technology: [
      {
        title: 'Erster kommerzieller Quantencomputer für Cloud-Nutzer freigeschaltet',
        desc: 'Forschende und Unternehmen können künftig über eine Schnittstelle auf über 1.000 Qubits zugreifen.',
        content: 'Ein Quantencomputing-Unternehmen hat den ersten kommerziell verfügbaren Quantencomputer für Cloud-Nutzer freigeschaltet. Forschende und Unternehmen können über eine Programmierschnittstelle auf mehr als 1.000 Qubits zugreifen und komplexe Berechnungen durchführen. Anwendungsgebiete reichen von der Materialforschung über Optimierungsprobleme bis hin zur kryptografischen Sicherheit. Kritiker weisen darauf hin, dass die Fehlerrate der Qubits weiterhin hoch ist und praktische Vorteile gegenüber klassischen Supercomputern noch begrenzt bleiben. Dennoch gilt der Schritt als wichtiger Meilenstein auf dem Weg zum nutzbaren Quantencomputing. Mehrere Pharma- und Chemieunternehmen haben bereits angekündigt, das System zu testen.'
      },
      {
        title: 'KI-Modell besteht renommierte Medizinprüfung mit Bestnote',
        desc: 'Das System erreichte bei einer simulierten Facharztprüfung Ergebnisse über dem menschlichen Durchschnitt.',
        content: 'Ein großes KI-Sprachmodell hat eine renommierte medizinische Facharztprüfung mit Bestnote bestanden. Bei der simulierten Prüfung erzielte das System Ergebnisse, die über dem menschlichen Durchschnitt lagen, und beantwortete auch komplexe Fallbeschreibungen korrekt. Entwickler betonen, dass das Modell als Unterstützung für Ärzte gedacht sei und keine Diagnosen selbst stelle. Datenschützer und Mediziner warnen vor zu großem Vertrauen in automatisierte Systeme, da KI-Modelle auch fehlerhafte oder veraltete Informationen reproduzieren können. Kliniken sehen dennoch großes Potenzial bei der Entlastung von Verwaltungsaufgaben und der Vorbereitung von Fallkonferenzen.'
      },
      {
        title: 'Neues Smartphone setzt auf Solarpanel-Rückseite',
        desc: 'Der Hersteller verspricht bis zu 30 Prozent mehr Akkulaufzeit durch nachladbare Sonnenenergie.',
        content: 'Ein Smartphone-Hersteller hat ein neues Modell vorgestellt, dessen Rückseite aus einem flexiblen Solarpanel besteht. Durch Sonnenenergie soll sich der Akku im Alltag um bis zu 30 Prozent länger halten, was besonders für Outdoor-Nutzer und Reisende interessant sein könnte. Das Gerät ist etwas dicker als herkömmliche Smartphones, dafür aber nach Angaben des Herstellers robust und wasserabweisend. Kritiker bezweifeln, dass die Solartechnik in nördlichen Breiten oder bei häufiger Innennutzung genug Energie liefert, um den Mehrpreis zu rechtfertigen. Umweltverbände begrüßen dennoch den Ansatz, die Lebensdauer mobiler Geräte durch nachhaltige Energiequellen zu verlängern.'
      },
    ],
  };

  const DEMO_SOURCES = [
    { name: 'World Today', id: 'world-today' },
    { name: 'Global Observer', id: 'global-observer' },
    { name: 'Daily Insight', id: 'daily-insight' },
    { name: 'Future Chronicle', id: 'future-chronicle' },
    { name: 'Pulse Network', id: 'pulse-network' },
  ];

  const DEMO_COUNTRIES = ['de', 'us', 'gb', 'fr', 'jp', 'ca', 'au', 'in', 'br', 'za'];

  // =========================================================
  // Helpers
  // =========================================================

  function generateId(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
    return Math.abs(h).toString(36);
  }

  function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function formatRelativeTime(isoDate) {
    const date = new Date(isoDate);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'vor wenigen Sekunden';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `vor ${minutes} Min.`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `vor ${hours} Std.`;
    const days = Math.floor(hours / 24);
    return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function truncate(str, max) {
    if (!str || str.length <= max) return str;
    return str.slice(0, max).trim() + '…';
  }

  function reducedMotion() {
    return state.prefersReducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // =========================================================
  // Demo Data Generation
  // =========================================================

  function generateDemoArticles() {
    const articles = [];
    const categories = CONFIG.categories.filter((c) => c !== 'all');

    categories.forEach((cat) => {
      const pool = DEMO_HEADLINES[cat] || [];
      pool.forEach((item, idx) => {
        const source = randomItem(DEMO_SOURCES);
        const country = randomItem(DEMO_COUNTRIES);
        const image = DEMO_IMAGES[cat][idx % DEMO_IMAGES[cat].length];
        const minutesAgo = randomInt(5, 2880);
        const publishedAt = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

        articles.push({
          id: generateId(item.title + publishedAt),
          title: item.title,
          description: item.desc,
          url: '#',
          urlToImage: image,
          source: { name: source.name, id: source.id },
          author: 'PulseWire Redaktion',
          publishedAt,
          category: cat,
          country,
          content: item.content || item.desc,
        });
      });
    });

    // Shuffle
    for (let i = articles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [articles[i], articles[j]] = [articles[j], articles[i]];
    }

    return articles;
  }

  // =========================================================
  // RSS News Server
  // =========================================================

  async function fetchFromServer(forceRefresh = false) {
    const endpoint = forceRefresh ? CONFIG.refreshEndpoint : CONFIG.apiBase;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Server antwortete mit ${response.status}`);
    }
    const data = await response.json();
    if (data.status === 'error') {
      throw new Error(data.message || 'Server-Fehler');
    }
    return (data.articles || []).map((article) => ({
      ...article,
      id: generateId(article.url || article.title),
      category: inferCategory(article),
      country: article.country || 'world',
    }));
  }

  function inferCategory(article) {
    const text = `${article.title || ''} ${article.description || ''} ${article.source?.name || ''}`.toLowerCase();
    const keywords = {
      business: ['business', 'wirtschaft', 'börse', 'finanzen', 'unternehmen', 'aktie', 'markt', 'konjunktur'],
      entertainment: ['entertainment', 'film', 'kino', 'musik', 'promi', 'show', 'kultur', 'festival'],
      health: ['health', 'gesundheit', 'medizin', 'krankenhaus', 'virus', 'impfung', 'arzt'],
      science: ['science', 'wissenschaft', 'forschung', 'weltraum', 'klima', 'studie'],
      sports: ['sport', 'fußball', 'tennis', 'olympia', 'liga', 'spieler', 'trainer'],
      technology: ['tech', 'technologie', 'ki', 'smartphone', 'internet', 'software', 'computer'],
    };

    for (const [cat, words] of Object.entries(keywords)) {
      if (words.some((w) => text.includes(w))) return cat;
    }
    return 'general';
  }

  async function loadNews(forceRefresh = false) {
    state.loading = true;
    state.error = null;
    renderLoading(true);
    const refreshIcon = document.querySelector('#refresh-btn i');
    if (refreshIcon) refreshIcon.classList.add('animate-spin');

    try {
      let articles;
      try {
        articles = await fetchFromServer(forceRefresh);
        state.useFallback = false;
      } catch (err) {
        console.warn('RSS-Server nicht erreichbar, verwende Fallback-Daten:', err);
        showToast('RSS-Server nicht erreichbar — Fallback-Daten werden verwendet.');
        await simulateNetworkDelay();
        articles = generateDemoArticles();
        state.useFallback = true;
      }

      state.articles = articles;
      state.lastUpdated = new Date();
      state.justLoaded = true;
      filterAndRender();
      state.justLoaded = false;
      showToast(`News aktualisiert · ${articles.length} Artikel`);
    } catch (err) {
      console.error(err);
      let message = err.message || 'Unbekannter Fehler';
      if (message.includes('network') || err.name === 'TypeError') {
        message = 'Netzwerkfehler: Bitte prüfen Sie Ihre Internetverbindung und stellen Sie sicher, dass der PulseWire-Server läuft (node server.js).';
      }
      state.error = message;
      renderError();
    } finally {
      state.loading = false;
      renderLoading(false);
      const refreshIcon = document.querySelector('#refresh-btn i');
      if (refreshIcon) refreshIcon.classList.remove('animate-spin');
    }
  }

  function simulateNetworkDelay() {
    return new Promise((resolve) => setTimeout(resolve, 600));
  }

  // =========================================================
  // Rendering
  // =========================================================

  function renderLoading(isLoading) {
    const skeleton = document.getElementById('loading-skeleton');
    const grid = document.getElementById('news-grid');
    if (isLoading) {
      skeleton.classList.remove('hidden');
      grid.classList.add('hidden');
    } else {
      skeleton.classList.add('hidden');
      grid.classList.remove('hidden');
    }
  }

  function renderError() {
    const grid = document.getElementById('news-grid');
    const empty = document.getElementById('empty-state');
    grid.innerHTML = '';
    grid.classList.remove('hidden');
    empty.classList.add('hidden');

    grid.innerHTML = `
      <div class="col-span-full max-w-xl mx-auto text-center py-12">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 text-primary mb-4">
          <i data-lucide="alert-triangle" class="w-8 h-8"></i>
        </div>
        <h3 class="font-serif text-xl font-bold text-foreground mb-2">Fehler beim Laden</h3>
        <p class="text-muted-foreground mb-6">${escapeHtml(state.error)}</p>
        <div class="flex flex-wrap justify-center gap-3">
          <button id="retry-btn" class="px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-red-700 transition-colors">
            Erneut versuchen
          </button>
          <button id="demo-btn" class="px-5 py-2.5 rounded-xl border border-border bg-card text-foreground font-medium hover:bg-muted transition-colors">
            Demo-Daten laden
          </button>
        </div>
      </div>
    `;
    lucide.createIcons();

    document.getElementById('retry-btn').addEventListener('click', () => loadNews());
    document.getElementById('demo-btn').addEventListener('click', () => {
      state.useFallback = true;
      loadNews(true);
    });
  }

  function filterAndRender() {
    const q = state.query.toLowerCase().trim();
    state.filtered = state.articles.filter((a) => {
      const matchesCategory = state.category === 'all' || a.category === state.category;
      const matchesQuery =
        !q ||
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q)) ||
        (a.source?.name && a.source.name.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });

    renderGrid();
    renderHero();
    renderStats();
    renderTrending();
    renderCategoryChart();
    renderTicker();
    updateLastUpdated();
    lucide.createIcons();
  }

  function renderHero() {
    const container = document.getElementById('hero-container');
    const heroArticle = state.filtered.find((a) => a.urlToImage) || state.filtered[0];

    if (!heroArticle) {
      container.innerHTML = '';
      container.classList.remove('opacity-0');
      return;
    }

    const img = heroArticle.urlToImage || randomItem(DEMO_IMAGES[heroArticle.category] || DEMO_IMAGES.general);
    container.innerHTML = `
      <article class="hero-card group cursor-pointer bg-card rounded-3xl shadow-lg overflow-hidden border border-border dark:border-white/5" data-id="${heroArticle.id}">
        <div class="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
          <img src="${escapeHtml(img)}" alt="" class="hero-image absolute inset-0 w-full h-full object-cover" loading="eager" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div class="flex flex-wrap items-center gap-3 mb-4">
              <span class="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider">Top-Story</span>
              <span class="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">${CONFIG.categoryLabels[heroArticle.category] || heroArticle.category}</span>
              <span class="text-white/80 text-xs font-mono">${formatRelativeTime(heroArticle.publishedAt)}</span>
            </div>
            <h1 class="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.05] mb-3 max-w-4xl">${escapeHtml(heroArticle.title)}</h1>
            <p class="text-white/90 text-base md:text-lg max-w-2xl line-clamp-2 mb-4">${escapeHtml(heroArticle.description || '')}</p>
            <div class="flex items-center gap-3 text-white/80 text-sm">
              <i data-lucide="globe" class="w-4 h-4"></i>
              <span>${escapeHtml(heroArticle.source?.name || 'Unbekannte Quelle')}</span>
            </div>
          </div>
        </div>
      </article>
    `;
    container.classList.remove('opacity-0');
    if (state.justLoaded && !reducedMotion()) {
      container.classList.add('animate-fade-in-up');
      container.addEventListener('animationend', () => container.classList.remove('animate-fade-in-up'), { once: true });
    }
    container.querySelector('.hero-card').addEventListener('click', () => openArticle(heroArticle.id));
  }

  function renderGrid() {
    const grid = document.getElementById('news-grid');
    const empty = document.getElementById('empty-state');
    const loadMoreWrap = document.getElementById('load-more-wrap');

    if (state.filtered.length === 0) {
      grid.classList.add('hidden');
      empty.classList.remove('hidden');
      loadMoreWrap.classList.add('hidden');
      return;
    }

    empty.classList.add('hidden');
    grid.classList.remove('hidden');

    if (state.view === 'list') {
      grid.className = 'grid grid-cols-1 gap-4';
    } else {
      grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
    }

    const items = state.filtered.slice(0, CONFIG.pageSize);
    grid.innerHTML = items.map((article, idx) => renderCard(article, idx)).join('');

    grid.querySelectorAll('.news-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.bookmark-btn')) return;
        openArticle(card.dataset.id);
      });
      card.querySelector('.bookmark-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(card.dataset.id);
      });
    });

    loadMoreWrap.classList.toggle('hidden', state.filtered.length <= CONFIG.pageSize);
  }

  function renderCard(article, idx) {
    const isFav = state.favorites.has(article.id);
    const img = article.urlToImage || randomItem(DEMO_IMAGES[article.category] || DEMO_IMAGES.general);
    const isList = state.view === 'list';

    const animate = state.justLoaded && !reducedMotion() ? 'animate-fade-in-up' : '';
    const delay = state.justLoaded && !reducedMotion() ? `style="animation-delay: ${idx * 50}ms"` : '';

    return `
      <article class="news-card group bg-card rounded-2xl border border-border dark:border-white/5 overflow-hidden shadow-sm flex ${isList ? 'flex-row' : 'flex-col'} ${animate} cursor-pointer"
               ${delay}
               data-id="${article.id}">
        <div class="${isList ? 'w-48 shrink-0' : 'w-full'} overflow-hidden ${isList ? 'aspect-[4/3]' : 'aspect-video'} relative">
          <img src="${escapeHtml(img)}" alt="" class="card-image absolute inset-0 w-full h-full object-cover" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'" />
          <span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/50 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">${CONFIG.categoryLabels[article.category] || article.category}</span>
        </div>
        <div class="flex flex-col flex-1 p-5">
          <div class="flex items-start justify-between gap-3 mb-2">
            <h3 class="font-serif ${isList ? 'text-xl' : 'text-lg'} font-semibold text-card-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">${escapeHtml(article.title)}</h3>
            <button class="bookmark-btn p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0" aria-label="${isFav ? 'Lesezeichen entfernen' : 'Lesezeichen setzen'}" aria-pressed="${isFav}">
              <i data-lucide="bookmark" class="w-5 h-5 ${isFav ? 'fill-current text-primary' : 'text-muted-foreground'}"></i>
            </button>
          </div>
          <p class="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">${escapeHtml(article.description || '')}</p>
          <div class="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border dark:border-white/5">
            <span class="font-medium truncate max-w-[55%]">${escapeHtml(article.source?.name || 'Unbekannt')}</span>
            <span class="font-mono">${formatRelativeTime(article.publishedAt)}</span>
          </div>
        </div>
      </article>
    `;
  }

  function renderStats() {
    const total = state.filtered.length;
    const sources = new Set(state.filtered.map((a) => a.source?.name).filter(Boolean)).size;
    const countries = new Set(state.filtered.map((a) => a.country).filter(Boolean)).size;

    animateNumber('stat-total', total);
    animateNumber('stat-sources', sources);
    animateNumber('stat-countries', countries);
  }

  function animateNumber(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = parseInt(el.textContent, 10) || 0;
    if (start === value) return;
    const duration = 600;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const current = Math.floor(start + (value - start) * progress);
      el.textContent = current.toLocaleString('de-DE');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function updateLastUpdated() {
    const el = document.getElementById('last-updated');
    if (state.lastUpdated) {
      el.textContent = '· ' + formatRelativeTime(state.lastUpdated);
    }
  }

  function renderTicker() {
    const track = document.getElementById('ticker-track');
    const breaking = state.filtered
      .filter((a) => a.category === 'general' || a.category === 'business')
      .slice(0, 6);

    if (breaking.length === 0) {
      track.innerHTML = '<span>Keine Breaking News verfügbar</span>';
      return;
    }

    const items = breaking
      .map(
        (a) => `
        <span class="inline-flex items-center gap-2">
          <i data-lucide="radio" class="w-3 h-3"></i>
          <span class="font-semibold">${escapeHtml(a.title)}</span>
          <span class="text-white/70">${escapeHtml(a.source?.name || '')}</span>
        </span>
      `
      )
      .join('<span class="text-white/30">•</span>');

    track.innerHTML = `<div class="ticker-track">${items}${items}</div>`;
  }

  function renderTrending() {
    const cloud = document.getElementById('trending-cloud');
    const words = {};
    state.filtered.forEach((a) => {
      const text = `${a.title || ''} ${a.description || ''}`;
      const tokens = text.split(/\s+/).filter((w) => w.length > 4 && !['einer', 'eines', 'sich', 'sind', 'wurde', 'wurden', 'nach', 'über', 'durch', 'einem'].includes(w.toLowerCase()));
      tokens.forEach((w) => {
        const key = w.toLowerCase().replace(/[^a-zäöüß]/gi, '');
        if (key.length < 4) return;
        words[key] = (words[key] || 0) + 1;
      });
    });

    const sorted = Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 18);

    if (sorted.length === 0) {
      cloud.innerHTML = '<span class="text-muted-foreground">Keine Trenddaten verfügbar</span>';
      return;
    }

    const max = sorted[0][1];
    cloud.innerHTML = sorted
      .map(([word, count]) => {
        const size = 0.75 + (count / max) * 1.25;
        const opacity = 0.6 + (count / max) * 0.4;
        return `
          <button class="tag-cloud-item px-3 py-1.5 rounded-full bg-muted text-foreground hover:bg-primary hover:text-white font-medium"
                  style="font-size:${size}rem; opacity:${opacity}"
                  data-word="${escapeHtml(word)}">
            #${escapeHtml(word)}
          </button>
        `;
      })
      .join('');

    cloud.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.getElementById('search-input').value = btn.dataset.word;
        state.query = btn.dataset.word;
        filterAndRender();
      });
    });
  }

  function renderCategoryChart() {
    const chart = document.getElementById('category-chart');
    const counts = {};
    state.articles.forEach((a) => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });

    const max = Math.max(1, ...Object.values(counts));
    const colors = {
      business: 'bg-blue-500',
      entertainment: 'bg-pink-500',
      general: 'bg-slate-500',
      health: 'bg-emerald-500',
      science: 'bg-violet-500',
      sports: 'bg-orange-500',
      technology: 'bg-cyan-500',
    };

    const rows = CONFIG.categories
      .filter((c) => c !== 'all')
      .map((cat) => {
        const count = counts[cat] || 0;
        const pct = Math.round((count / max) * 100);
        return `
          <div class="group">
            <div class="flex items-center justify-between text-sm mb-1">
              <span class="font-medium text-foreground">${CONFIG.categoryLabels[cat]}</span>
              <span class="font-mono text-muted-foreground">${count}</span>
            </div>
            <div class="category-bar-bg">
              <div class="category-bar-fill ${colors[cat] || 'bg-primary'}" style="width: ${pct}%"></div>
            </div>
          </div>
        `;
      })
      .join('');

    chart.innerHTML = rows;
  }

  function renderFilters() {
    const container = document.getElementById('category-filters');
    container.innerHTML = CONFIG.categories
      .map(
        (cat) => `
        <button
          class="filter-pill ${state.category === cat ? 'bg-primary text-white border-primary' : 'bg-card text-foreground border-border hover:bg-muted'}"
          data-category="${cat}"
          aria-pressed="${state.category === cat}"
        >
          ${CONFIG.categoryLabels[cat]}
        </button>
      `
      )
      .join('');

    container.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.category = btn.dataset.category;
        renderFilters();
        filterAndRender();
      });
    });
  }

  // =========================================================
  // Article Modal
  // =========================================================

  function openArticle(id) {
    const article = state.articles.find((a) => a.id === id);
    if (!article) return;

    const modal = document.getElementById('article-modal');
    const content = document.getElementById('modal-content');
    const img = article.urlToImage || randomItem(DEMO_IMAGES[article.category] || DEMO_IMAGES.general);

    content.innerHTML = `
      <div class="aspect-video relative overflow-hidden">
        <img src="${escapeHtml(img)}" alt="" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'" />
        <span class="absolute top-4 left-4 px-3 py-1 rounded-lg bg-primary text-white text-xs font-bold uppercase tracking-wider">${CONFIG.categoryLabels[article.category] || article.category}</span>
      </div>
      <div class="p-6 md:p-10">
        <div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
          <span class="font-medium text-foreground">${escapeHtml(article.source?.name || 'Unbekannte Quelle')}</span>
          <span>•</span>
          <span class="font-mono">${new Date(article.publishedAt).toLocaleString('de-DE')}</span>
          <span>•</span>
          <span>${escapeHtml(article.author || 'PulseWire Redaktion')}</span>
        </div>
        <h2 id="modal-title" class="font-serif text-2xl md:text-4xl font-bold text-foreground mb-6 leading-tight">${escapeHtml(article.title)}</h2>
        <p class="text-lg text-card-foreground leading-relaxed mb-6">${escapeHtml(article.description || '')}</p>
        <p class="text-base text-muted-foreground leading-relaxed mb-8">${escapeHtml(article.content || 'Vollständiger Artikeltext steht in der verlinkten Originalquelle zur Verfügung.')}</p>
        <div class="flex flex-wrap gap-3">
          <a href="${escapeHtml(article.url || '#')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-red-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary">
            <span>Originalartikel lesen</span>
            <i data-lucide="external-link" class="w-4 h-4"></i>
          </a>
          <button id="modal-bookmark" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-foreground font-medium hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <i data-lucide="bookmark" class="w-4 h-4 ${state.favorites.has(article.id) ? 'fill-current text-primary' : ''}"></i>
            <span>${state.favorites.has(article.id) ? 'Gespeichert' : 'Speichern'}</span>
          </button>
        </div>
      </div>
    `;

    state.previouslyFocused = document.activeElement;
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      modal.classList.add('modal-open');
      document.getElementById('modal-close').focus();
    });
    document.body.style.overflow = 'hidden';
    lucide.createIcons();

    document.getElementById('modal-bookmark').addEventListener('click', () => {
      toggleFavorite(article.id);
      openArticle(article.id); // re-render
    });
  }

  function closeArticleModal() {
    const modal = document.getElementById('article-modal');
    modal.classList.remove('modal-open');
    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
      if (state.previouslyFocused && state.previouslyFocused.focus) {
        state.previouslyFocused.focus();
      }
    }, 300);
  }

  // =========================================================
  // Favorites
  // =========================================================

  function loadFavorites() {
    try {
      const raw = JSON.parse(localStorage.getItem('pulsewire_favorites') || '[]');
      state.favorites = new Set(raw);
    } catch {
      state.favorites = new Set();
    }
  }

  function saveFavorites() {
    localStorage.setItem('pulsewire_favorites', JSON.stringify([...state.favorites]));
    renderFavoritesCount();
    renderFavoritesList();
  }

  function toggleFavorite(id) {
    if (state.favorites.has(id)) {
      state.favorites.delete(id);
      showToast('Artikel aus Lesezeichen entfernt');
    } else {
      state.favorites.add(id);
      showToast('Artikel gespeichert');
    }
    saveFavorites();
    filterAndRender();
  }

  function renderFavoritesCount() {
    const badge = document.getElementById('fav-count');
    const count = state.favorites.size;
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  }

  function renderFavoritesList() {
    const list = document.getElementById('favorites-list');
    const favArticles = [...state.favorites]
      .map((id) => state.articles.find((a) => a.id === id))
      .filter(Boolean);

    if (favArticles.length === 0) {
      list.innerHTML = `
        <div class="text-center py-12">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-4">
            <i data-lucide="bookmark-x" class="w-7 h-7 text-muted-foreground"></i>
          </div>
          <h3 class="font-serif text-lg font-bold text-foreground mb-2">Noch keine Lesezeichen</h3>
          <p class="text-sm text-muted-foreground max-w-xs mx-auto">Klicken Sie auf das Lesezeichen-Symbol bei einem Artikel, um ihn hier zu speichern.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    list.innerHTML = favArticles
      .map(
        (a) => `
        <article class="group flex gap-4 p-3 rounded-xl bg-card border border-border dark:border-white/5 hover:border-primary/40 transition-colors">
          <div class="w-20 h-20 rounded-lg overflow-hidden shrink-0">
            <img src="${escapeHtml(a.urlToImage || randomItem(DEMO_IMAGES[a.category] || DEMO_IMAGES.general))}" alt="" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'" />
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-serif font-semibold text-foreground text-sm leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors cursor-pointer" data-id="${a.id}">${escapeHtml(a.title)}</h4>
            <p class="text-xs text-muted-foreground mb-2">${escapeHtml(a.source?.name || '')} · ${formatRelativeTime(a.publishedAt)}</p>
            <button class="remove-fav text-xs text-primary font-medium hover:underline" data-id="${a.id}">Entfernen</button>
          </div>
        </article>
      `
      )
      .join('');

    list.querySelectorAll('h4').forEach((el) => {
      el.addEventListener('click', () => {
        openArticle(el.dataset.id);
        closeFavoritesDrawer();
      });
    });
    list.querySelectorAll('.remove-fav').forEach((btn) => {
      btn.addEventListener('click', () => toggleFavorite(btn.dataset.id));
    });
  }

  function openFavoritesDrawer() {
    state.previouslyFocused = document.activeElement;
    renderFavoritesList();
    const drawer = document.getElementById('favorites-drawer');
    drawer.classList.remove('hidden');
    requestAnimationFrame(() => {
      drawer.classList.add('drawer-open');
      document.getElementById('favorites-close').focus();
    });
    document.body.style.overflow = 'hidden';
  }

  function closeFavoritesDrawer() {
    const drawer = document.getElementById('favorites-drawer');
    drawer.classList.remove('drawer-open');
    setTimeout(() => {
      drawer.classList.add('hidden');
      document.body.style.overflow = '';
      if (state.previouslyFocused && state.previouslyFocused.focus) {
        state.previouslyFocused.focus();
      }
    }, 300);
  }

  // =========================================================
  // Theme
  // =========================================================

  function initTheme() {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    }
  }

  function toggleTheme() {
    state.darkMode = !state.darkMode;
    document.documentElement.classList.toggle('dark', state.darkMode);
    localStorage.setItem('pulsewire_dark_mode', state.darkMode);
  }

  // =========================================================
  // Toast
  // =========================================================

  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('translate-y-24', 'opacity-0');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('translate-y-24', 'opacity-0');
    }, 3000);
  }

  // =========================================================
  // Event Listeners
  // =========================================================

  function initEventListeners() {
    document.getElementById('refresh-btn').addEventListener('click', () => loadNews(true));

    document.getElementById('favorites-btn').addEventListener('click', openFavoritesDrawer);
    document.getElementById('favorites-close').addEventListener('click', closeFavoritesDrawer);
    document.getElementById('favorites-backdrop').addEventListener('click', closeFavoritesDrawer);

    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    document.getElementById('modal-close').addEventListener('click', closeArticleModal);
    document.getElementById('modal-backdrop').addEventListener('click', closeArticleModal);

    document.getElementById('reset-filters').addEventListener('click', () => {
      state.query = '';
      state.category = 'all';
      searchInput.value = '';
      if (mobileSearchInput) mobileSearchInput.value = '';
      renderFilters();
      filterAndRender();
    });

    document.getElementById('view-grid').addEventListener('click', () => {
      state.view = 'grid';
      updateViewButtons();
      filterAndRender();
    });
    document.getElementById('view-list').addEventListener('click', () => {
      state.view = 'list';
      updateViewButtons();
      filterAndRender();
    });

    document.getElementById('load-more').addEventListener('click', () => {
      CONFIG.pageSize += 12;
      filterAndRender();
    });

    const searchInput = document.getElementById('search-input');
    const mobileSearchInput = document.getElementById('mobile-search-input');
    let debounceTimer = null;

    function syncSearch(value) {
      state.query = value;
      searchInput.value = value;
      if (mobileSearchInput) mobileSearchInput.value = value;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        filterAndRender();
      }, CONFIG.debounceDelay);
    }

    searchInput.addEventListener('input', (e) => syncSearch(e.target.value));
    if (mobileSearchInput) {
      mobileSearchInput.addEventListener('input', (e) => syncSearch(e.target.value));
    }

    // Respect reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    state.prefersReducedMotion = motionQuery.matches;
    motionQuery.addEventListener('change', (e) => {
      state.prefersReducedMotion = e.matches;
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeArticleModal();
        closeApiModal();
        closeFavoritesDrawer();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  function updateViewButtons() {
    const gridBtn = document.getElementById('view-grid');
    const listBtn = document.getElementById('view-list');
    if (state.view === 'grid') {
      gridBtn.classList.add('text-foreground');
      gridBtn.classList.remove('text-muted-foreground');
      listBtn.classList.add('text-muted-foreground');
      listBtn.classList.remove('text-foreground');
    } else {
      listBtn.classList.add('text-foreground');
      listBtn.classList.remove('text-muted-foreground');
      gridBtn.classList.add('text-muted-foreground');
      gridBtn.classList.remove('text-foreground');
    }
  }

  // =========================================================
  // Auto-refresh
  // =========================================================

  function startAutoRefresh() {
    if (state.refreshTimer) clearInterval(state.refreshTimer);
    state.refreshTimer = setInterval(() => {
      loadNews();
    }, CONFIG.refreshInterval);
  }

  // =========================================================
  // Initialization
  // =========================================================

  function init() {
    loadFavorites();
    initTheme();
    initEventListeners();
    renderFilters();
    renderFavoritesCount();
    updateViewButtons();
    loadNews().then(() => {
      startAutoRefresh();
    });

    // Periodic relative-time update
    setInterval(() => {
      updateLastUpdated();
      document.querySelectorAll('.font-mono').forEach((el) => {
        // Lightweight re-render not needed; timestamps are static strings
      });
    }, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
