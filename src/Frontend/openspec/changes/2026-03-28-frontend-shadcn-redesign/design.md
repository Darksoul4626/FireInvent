## Context

Die bestehende UI ist funktional, aber stark durch Inline-Styling und seitenlokale Muster gepraegt. Dieses Change kapselt ein reines Frontend-Redesign mit shadcn/ui, ohne fachliche Aenderung an API oder Backend.

Das Ziel ist eine moderne, feuerwehrnahe Bedienoberflaeche mit:
- permanenter einklappbarer Sidenav,
- Theme-Umschaltung (Light/Dark),
- responsivem Verhalten fuer alle Kernseiten.

## Goals / Non-Goals

**Goals:**
- Einheitliches Designsystem auf Basis von shadcn/ui.
- App-Shell mit permanenter, einklappbarer Sidenav auf Desktop.
- Mobile Drawer als responsiver Ersatz fuer die Sidenav.
- Markantes, aber kontrolliertes Feuerwehr-Farbsystem.
- Lesbarkeit und Kontraste in Light und Dark Theme.

**Non-Goals:**
- Keine neue Geschaeftslogik.
- Keine API- oder Datenmodellmigration.
- Keine funktionale Erweiterung jenseits UI/UX und Navigation.

## Decisions

1. UI Foundation: shadcn/ui als Standard fuer Buttons, Inputs, Form-Controls, Cards, Tabellen-Grundstruktur und Navigationsbausteine.
- Why: Einheitliche Komponenten und geringere Styling-Streuung.

2. Navigation: Permanente Sidenav, die auf Desktop einklappbar ist.
- Why: Platzgewinn bei Datentabellen und schnelle Orientierung bei mehreren Bereichen.
- Mobile: Drawer mit denselben Navigationspunkten.

3. Theme: Light und Dark Mode mit zentralen Design-Tokens.
- Why: Konsistenz, wartbare Farblogik, bessere Lesbarkeit je Einsatzkontext.

4. Branding: Feuerwehrrot als markanter Akzent, jedoch nicht leuchtend/flaechig dominierend.
- Why: Wiedererkennbarkeit ohne visuelle Ueberlastung.
- Umsetzung: Rot vor allem fuer primaere Akzente, aktive Navigation, wichtige Badges; Flaechen bleiben neutral.

5. Responsiveness: Mobile-first Abstaende/Typografie; Tabellen mit horizontalem Scroll-Fallback und optionalen kompakten Darstellungen.
- Why: Bedienbarkeit auf kleinen Geraeten bei grossen Datenmengen.

## Open Question

- Soll ein optionaler "Kompaktmodus" (reduzierte Row-Hoehen, geringere Abstaende, dichtere Tabellenansichten fuer Leitstellen-/Power-User-Szenarien) bereits in diesem Change enthalten sein oder als Folge-Change umgesetzt werden?

## Architecture Sketch

```text
Desktop
┌──────────────────────────────────────────────────────────────┐
│ Topbar: Titel | Theme Switch | globale Aktionen             │
├───────────────┬──────────────────────────────────────────────┤
│ Sidenav       │ Hauptinhalt                                  │
│ (collapsible) │ - Seitenkopf                                 │
│               │ - Filter/Formulare                           │
│               │ - Tabelle/Kalender                           │
└───────────────┴──────────────────────────────────────────────┘

Mobile
┌──────────────────────────────────────────────────────────────┐
│ Topbar + Menu Trigger + Theme Switch                        │
├──────────────────────────────────────────────────────────────┤
│ Drawer Navigation                                            │
├──────────────────────────────────────────────────────────────┤
│ 1-spaltiger Inhalt                                           │
└──────────────────────────────────────────────────────────────┘
```

## Risks / Trade-offs

- FullCalendar integriert sich nicht automatisch in jedes shadcn-Styling und benoetigt gezielte Theme-Anpassungen.
- Erhalt bestehender `data-testid` muss aktiv beruecksichtigt werden, um Teststabilitaet zu sichern.
- Zu starke visuelle Akzente koennen Lesbarkeit bei Datendichte verschlechtern; deshalb neutrales Basislayout mit dosierten Brand-Akzenten.

## Validation Strategy

- Visuelle und funktionale Pruefung aller Kernseiten in Light und Dark Theme.
- Responsive Checks fuer typische Breakpoints (mobile, tablet, desktop).
- Bestehende Unit-/E2E-Tests anpassen, aber stabile Test-IDs beibehalten.
