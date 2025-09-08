// Utilities for consistent Asia/Manila time handling across the app
// Always treat display times as Asia/Manila without changing UTC data coming from backend.

export const MANILA_TZ = "Asia/Manila";

export function nowInManila(): Date {
    // Create a Date representing now; JS Date is UTC-based with local methods.
    // For display, we will always pass timeZone option to Intl APIs.
    return new Date();
}

export function formatManilaDateTime(date: Date | string | number, options?: Intl.DateTimeFormatOptions, locale: string = "en-PH"): string {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    return d.toLocaleString(locale, {timeZone: MANILA_TZ, ...options});
}

export function formatManilaTime(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
    const base: Intl.DateTimeFormatOptions = {hour: "2-digit", minute: "2-digit", hour12: true, timeZone: MANILA_TZ};
    return formatManilaDateTime(date, {...base, ...options});
}

export function formatManilaDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
    const base: Intl.DateTimeFormatOptions = {year: "numeric", month: "2-digit", day: "2-digit", timeZone: MANILA_TZ};
    return formatManilaDateTime(date, {...base, ...options}, "en-CA"); // en-CA gives YYYY-MM-DD by default
}

export function getManilaHMMinutes(date: Date | string | number): number {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    const parts = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: MANILA_TZ
    }).formatToParts(d);
    const hh = Number(parts.find(p => p.type === "hour")?.value || 0);
    const mm = Number(parts.find(p => p.type === "minute")?.value || 0);
    return hh * 60 + mm;
}

export function manilaFilenameTimestamp(date: Date | string | number = new Date()): string {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: MANILA_TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(d);
    const get = (t: string) => parts.find(p => p.type === t)?.value || "";
    const yyyy = get("year");
    const mm = get("month");
    const dd = get("day");
    const hh = get("hour");
    const mi = get("minute");
    return `${yyyy}-${mm}-${dd}_${hh}-${mi}`;
}
