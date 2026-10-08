# Globale Tribute Wall einrichten (Supabase)

Ohne Konfiguration läuft die Tribute Wall im **lokalen Modus**: Die Kerzen landen nur im
eigenen Browser. Mit einem kostenlosen [Supabase](https://supabase.com)-Projekt sehen alle Besucher
dieselben Kerzen, und neue Kerzen erscheinen alle 30 Sekunden automatisch.

## 1. Projekt anlegen

1. Auf supabase.com ein neues Projekt erstellen (der Free Tier reicht).
2. **Project Settings → API**: die *Project URL* und den *anon public* Key kopieren.

## 2. Tabelle + Rechte anlegen

Im **SQL Editor** ausführen:

```sql
create table public.candles (
  id          bigint generated always as identity primary key,
  name        text not null default '' check (char_length(name) <= 20),
  message     text not null default '' check (char_length(message) <= 140),
  created_at  timestamptz not null default now()
);

create index candles_created_at_idx on public.candles (created_at desc);

alter table public.candles enable row level security;

-- Jeder darf lesen
create policy "Kerzen lesen" on public.candles
  for select to anon using (true);

-- Jeder darf anzünden – aber nichts ändern oder löschen
create policy "Kerzen anzünden" on public.candles
  for insert to anon
  with check (char_length(name) <= 20 and char_length(message) <= 140);

grant select, insert on public.candles to anon;
```

`update` und `delete` sind für Besucher bewusst **nicht** erlaubt. Moderieren (z. B. Spam
löschen) kannst du im Supabase-Dashboard unter *Table Editor → candles*.

### Optional: einfacher Spam-Schutz

Die Seite erlaubt pro Browser nur eine Kerze alle 20 Sekunden. Serverseitig kann man
zusätzlich identische Einträge, die kurz hintereinander kommen, blockieren:

```sql
create or replace function public.candles_no_spam()
returns trigger language plpgsql as $$
begin
  if exists (
    select 1 from public.candles
    where name = new.name and message = new.message
      and created_at > now() - interval '1 minute'
  ) then
    raise exception 'Bitte nicht spammen 🕯️';
  end if;
  return new;
end $$;

create trigger candles_no_spam before insert on public.candles
  for each row execute function public.candles_no_spam();
```

## 3. Seite verbinden

In `js/config.js` eintragen:

```js
window.OZZY_CONFIG = {
  supabaseUrl: "https://DEIN-PROJEKT.supabase.co",
  supabaseAnonKey: "eyJ...",
};
```

Der *anon* Key ist für den Browser vorgesehen und darf öffentlich im Repo stehen. Den
**service_role** Key darfst du dagegen niemals eintragen.

Nach dem Deploy zeigt die Wall oben **„🌍 Live – Kerzen aus aller Welt“**. Ist Supabase
nicht erreichbar, schaltet sie automatisch auf **„⚠️ Offline“** um und speichert lokal.

## Datenschutz

Gespeichert werden nur der freiwillig eingegebene Name, die Botschaft und der Zeitpunkt.
Ergänze in `pages/datenschutz.html` einen Hinweis auf Supabase als Auftragsverarbeiter
und wähle bei der Projekterstellung am besten eine EU-Region (z. B. Frankfurt).
