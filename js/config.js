// js/config.js – öffentliche Laufzeit-Konfiguration
//
// Globale Tribute Wall (Supabase): Projekt-URL und den Publishable Key (sb_publishable_…)
// bzw. den Legacy anon Key (eyJ…) eintragen.
// Der anon Key ist für den Browser gedacht und darf öffentlich sein – die Rechte
// regelt Row Level Security in der Datenbank (siehe docs/tribute-wall.md).
// Leer lassen = lokaler Modus (Kerzen nur im eigenen Browser).
window.OZZY_CONFIG = {
  supabaseUrl: "https://yjsqadyjstitpplrayuc.supabase.co",
  supabaseAnonKey: "sb_publishable_Nt8fzCBVs7ZQszAD2yFGRg_n-DNYXy3",
};
