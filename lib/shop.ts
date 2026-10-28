/**
 * Numéro WhatsApp de la boutique, au format international sans + ni espaces.
 * Remplacez la valeur par défaut, ou définissez NEXT_PUBLIC_WHATSAPP_NUMBER.
 */
const FALLBACK_WHATSAPP_NUMBER = "243810000000";

function readWhatsAppNumber(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : FALLBACK_WHATSAPP_NUMBER;
}

export const shop = {
  name: "Zaveli",
  city: "Kinshasa",
  whatsappNumber: readWhatsAppNumber(),
} as const;
