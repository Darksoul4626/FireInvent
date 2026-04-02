## Context

FireInvent verwendet derzeit eine gemeinsame `docker-compose.yml`, die auf lokale Entwicklung ausgelegt ist (Host-Port-Mappings, lokale Defaults, direkte Entwickler-Workflows). Fuer Coolify-Hosting benoetigt der Betrieb eine eigenstaendige Compose-Definition, die mit platformverwalteter Vernetzung, persistenten Volumes und klaren Pflicht-Umgebungsvariablen funktioniert.

Stakeholder:
- Betrieb/Deployment: braucht reproduzierbare, Coolify-taugliche Definition ohne lokale Sonderannahmen.
- Entwicklung: braucht weiterhin unveraenderte lokale Compose-Workflows.

Constraint:
- Die bestehende lokale Orchestrierung darf nicht regressieren.

## Goals / Non-Goals

**Goals:**
- Separate Coolify-Compose-Datei fuer Frontend, Backend und Datenbank bereitstellen.
- Service-Kopplung fuer Coolify klar definieren (interne DNS-Namen, Healthchecks, Persistenz, Restart-Verhalten).
- Pflicht-Umgebungsvariablen fuer betriebsrelevante Werte explizit markieren.
- Dokumentieren, wann lokale Compose und wann Coolify-Compose verwendet wird.

**Non-Goals:**
- Keine Aenderung der Fachlogik in Inventar-, Verleih- oder Verfuegbarkeitsmodulen.
- Kein Wechsel des Orchestrators (z. B. Kubernetes).
- Keine Aenderung am OpenAPI-Vertrag oder API-Client-Generierungsprozess.

## Decisions

1. **Separate Coolify manifest statt Ueberladung der bestehenden lokalen Compose-Datei**
   - Entscheidung: Eine neue Datei (z. B. `docker-compose.coolify.yml`) wird als Source of Truth fuer Coolify-Deployments eingefuehrt.
   - Rationale: Lokale Entwickleranforderungen und Coolify-Betriebsanforderungen unterscheiden sich; Trennung reduziert Konfigurationskonflikte.
   - Alternative: Eine einzige Datei mit vielen bedingten Overrides.
   - Warum verworfen: Hoeheres Fehlerrisiko und geringere Lesbarkeit fuer Betrieb und Entwicklung.

2. **Platform-managed networking in Coolify manifest**
   - Entscheidung: Keine benutzerdefinierten Docker-Netzwerke im Coolify-Manifest.
   - Rationale: Coolify empfiehlt platformverwaltete Vernetzung, um Routing- und Erreichbarkeitsprobleme zu vermeiden.
   - Alternative: Eigene Bridge-Netzwerke.
   - Warum verworfen: Erhoeht Risiko fuer Gateway-/Reachability-Probleme in Coolify.

3. **Explizite Pflichtvariablen und persistente benannte Volumes**
   - Entscheidung: Betriebsrelevante Variablen werden als erforderlich markiert; persistente Daten werden ueber benannte Volumes gemountet.
   - Rationale: Fruehzeitige Validierung reduziert Fehlstarts; benannte Volumes sichern Daten ueber Redeploys hinweg.
   - Alternative: Stille Defaults und anonyme Volumes.
   - Warum verworfen: Unscharfes Fehlverhalten und potenzieller Datenverlust.

4. **Healthchecks und Startabhaengigkeiten beibehalten/angleichen**
   - Entscheidung: Das Coolify-Manifest enthaelt pruefbare Healthchecks und servicebasierte Abhaengigkeiten.
   - Rationale: Stabilere Initialisierungskette fuer Datenbank, API und Frontend.
   - Alternative: Nur Startreihenfolge ohne Health-Semantik.
   - Warum verworfen: Hoehere Wahrscheinlichkeit von Boot-time Failures.

## Risks / Trade-offs

- [Divergenz zwischen lokaler und Coolify-Compose] -> Mitigation: Dokumentierte Ownership und Review-Regel fuer beide Compose-Dateien bei Infrastruktur-Aenderungen.
- [Zu strikte Pflichtvariablen blockieren Erstdeployment] -> Mitigation: Dokumentierte Mindestvariablen und klare Fehlermeldungen.
- [Uebernahme lokaler Port-Annahmen in Coolify] -> Mitigation: Spec-Anforderung fuer Coolify-konforme Service-Erreichbarkeit ohne lokale Host-Port-Abhaengigkeit.

## Migration Plan

1. Neue Coolify-Compose-Datei hinzufuegen und lokal auf syntaktische Gueltigkeit pruefen.
2. Deployment-Dokumentation um Auswahlpfad (lokal vs Coolify) erweitern.
3. In Coolify neues Deployment mit der neuen Datei konfigurieren und Erststart validieren.
4. Bei Problemen Rollback durch Rueckkehr auf vorherige Deployment-Konfiguration in Coolify; lokaler Betrieb bleibt unberuehrt.

## Open Questions

- Soll die Datenbank in derselben Coolify-Compose-Datei laufen oder als separater, von Coolify verwalteter Datenbank-Service betrieben werden?
- Welche produktiven Defaults (z. B. Seed-Mode, ASPNETCORE_ENVIRONMENT) sind fuer den ersten Rollout verbindlich?
