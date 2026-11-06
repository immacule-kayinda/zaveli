const zone = "Africa/Kinshasa";

const dateTime = new Intl.DateTimeFormat("fr-FR", { timeZone: zone, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const dateOnly = new Intl.DateTimeFormat("fr-FR", { timeZone: zone, day: "numeric", month: "long", year: "numeric" });
const dayShort = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", day: "numeric", month: "short" });

export function formatDateTime(timestamp: number): string {
  return dateTime.format(timestamp);
}

export function formatDate(timestamp: number): string {
  return dateOnly.format(timestamp);
}

/** `day` est une clé `AAAA-MM-JJ` produite par `dayKey`. */
export function formatDayKey(day: string): string {
  return dayShort.format(new Date(`${day}T12:00:00Z`));
}
