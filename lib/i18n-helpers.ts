import { cacheLife } from "next/cache";

// Cacheable function to load messages for a specific locale
export async function getCachedMessages(locale: string) {
  "use cache";
  cacheLife("max"); // Messages are static, cache forever

  return (await import(`@/messages/${locale}.json`)).default;
}

// Cacheable function to get translations for a specific namespace
// Returns the namespace messages object directly (not a function)
export async function getCachedTranslations(
  locale: string,
  namespace: string
) {
  "use cache";
  cacheLife("max");

  const messages = await getCachedMessages(locale);
  return messages[namespace] || {};
}

// Helper function to get a translation value from a namespace object
export function getTranslation(
  namespaceMessages: Record<string, any>,
  key: string
): string {
  const keys = key.split(".");
  let value: any = namespaceMessages;
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}

