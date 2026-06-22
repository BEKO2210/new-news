> ⚡ **PulseWire** — Autonome Welt-News, visuell neu erfunden.

![Status](https://img.shields.io/badge/status-ready-success)
![Stack](https://img.shields.io/badge/stack-HTML%20%7C%20Tailwind%20%7C%20Vanilla%20JS%20%7C%20Node.js-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## 🚀 Was ist PulseWire?

**PulseWire** ist eine autonome Welt-News-Dashboard, das echte Schlagzeilen aus öffentlichen RSS-Feeds internationaler Medien abruft und in einer hochmodernen, responsiven UI visualisiert — ganz ohne API-Key.

Die Benutzeroberfläche ist das Herzstück: ein durchdachtes Design-System aus dem `ui-ux-pro-max`-Skill kombiniert Editorial-Typografie, Glassmorphism, Dark Mode, Motion-Design und datengetriebene Visualisierungen.

---

## ✨ Features

| Bereich | Funktion |
|---------|----------|
| **Autonome News** | Automatischer Abruf alle 5 Minuten, manuelles Refresh, Live-Status-Indikator |
| **Echte RSS-News** | Ohne API-Key: BBC, Tagesschau, Spiegel, ZEIT, Guardian, NYT, WELT |
| **Fallback-Daten** | Umfangreiche Demo-Daten, falls der Server nicht erreichbar ist |
| **Kategorien** | Wirtschaft, Unterhaltung, Allgemein, Gesundheit, Wissenschaft, Sport, Technologie |
| **Suche** | Echtzeit-Suche mit Debounce |
| **Favoriten** | Lesezeichen mit `localStorage`-Persistenz |
| **Visualisierung** | Trending-Tag-Cloud, Kategorie-Balkendiagramm, Live-Statistiken |
| **Breaking Ticker** | Horizontales Breaking-News-Band |
| **Dark Mode** | Vollständiges Light/Dark-Theme mit Persistenz |
| **Responsive** | Mobile-first, optimiert für 320 px bis 4K |
| **Barrierefreiheit** | ARIA-Labels, Tastaturnavigation, `prefers-reduced-motion` |

---

## 🖥️ Live starten

### Variante 1: Lokaler Server mit echten News (empfohlen)

```bash
npm install   # einmalig: installiert rss-parser
node server.js
```

Öffne dann: [http://localhost:8080](http://localhost:8080)

### Variante 2: Nur Frontend

`index.html` kann direkt geöffnet werden, zeigt dann aber nur die Fallback-Demo-Daten an (keine echten RSS-Feeds wegen Browser-CORS).

---

## 📡 Datenquellen

PulseWire aggregiert öffentliche RSS-Feeds von:

- **BBC News** (World, Business, Technology, Science, Health, Entertainment, Sport)
- **Tagesschau**
- **SPIEGEL**
- **ZEIT ONLINE**
- **The Guardian**
- **The New York Times**
- **DIE WELT**

Für den produktiven Betrieb sollte der Server regelmäßig gewartet und ggf. um weitere Quellen ergänzt werden.

---

## 🛠️ Technologien

- **HTML5** semantisches Markup
- **Tailwind CSS** via CDN
- **Vanilla JavaScript** (kein Build-Step nötig)
- **Node.js** + **rss-parser** für Server-seitige RSS-Aggregation
- **Lucide Icons**
- **Google Fonts** (Newsreader, Roboto, JetBrains Mono)

---

## 📁 Projektstruktur

```
Free_open_media/
├── index.html              # Hauptseite
├── app.js                  # Anwendungslogik & Daten
├── styles.css              # Zusätzliche Styles & Animationen
├── server.js               # Optionaler lokaler Node-Server
├── design-system/
│   └── MASTER.md           # Vollständiges Design-System
└── README.md               # Diese Datei
```

---

## 🎨 Design-System

Das Design wurde auf Basis des `ui-ux-pro-max`-Skills erstellt:

- **Produkttyp:** News/Media Platform (#66)
- **Primärstil:** Minimalism + Flat Design
- **Sekundärstile:** Dark Mode (OLED), Editorial Magazine Grid
- **Farben:** Breaking Red `#DC2626`, Link Blue `#1E40AF`, warmes Paper `#FEF2F2`
- **Typografie:** Newsreader (Headlines) + Roboto (Body) + JetBrains Mono (Data)

Alle Details stehen in [`design-system/MASTER.md`](./design-system/MASTER.md).

---

## 🧪 Getestet

- ✅ Chrome / Edge / Firefox
- ✅ Mobile Viewports (375 px – 1536 px)
- ✅ Dark Mode & Light Mode
- ✅ Tastaturnavigation
- ✅ Demo-Modus ohne Server
- ✅ RSS-Modus mit laufendem Server
- ✅ Fallback bei Netzwerkfehlern

---

## 📄 Lizenz

MIT — frei verwendbar, modifizierbar und erweiterbar.

---

> **Hinweis:** PulseWire wurde als Demo-Projekt gebaut. Die RSS-Feeds werden serverseitig aggregiert, um Browser-CORS-Probleme zu vermeiden.
