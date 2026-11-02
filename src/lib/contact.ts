export const CONTACT_PHONE_DISPLAY = "+255 713 134 116";
export const CONTACT_PHONE_TEL = "+255713134116";
/** Digits only, for wa.me links. */
export const CONTACT_WHATSAPP = "255713134116";
export const CONTACT_EMAIL = "support@kbestoretz.co.tz";

/** Google Maps search link for a store location. */
export function mapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
