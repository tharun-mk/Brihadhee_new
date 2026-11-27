/** Catering helpers: readiness gates, the WhatsApp number and Service schema. Only confirmed facts are used. */
import { facts } from '../data/brand-facts';
import { ok } from './facts';
import { absUrl } from './site';
import { prune } from './schema';

const c = facts.catering;

export const cateringWhatsapp = (): string | null => (ok(c.whatsapp) ? c.whatsapp : ok(facts.whatsapp) ? facts.whatsapp : null);
export const waDigits = (): string | null => cateringWhatsapp()?.replace(/[^\d]/g, '') ?? null;
export const minGuests = (): number | null => c.minimumGuests;

/** "from 50 guests" or an empty string when the minimum is unconfirmed. */
export const fromMin = (): string => (c.minimumGuests ? `from ${c.minimumGuests} guests` : '');

const q4 = () => c.offered && cateringWhatsapp() !== null; // WhatsApp number (Q4)
const q5 = () => ok(c.leadTimeSentence) && c.areasServed.length > 0; // catering basics (Q5)
const q11q15 = () => c.eventTypesAnswered && c.dishes.length > 0; // event types (Q11) and catering menu (Q15)

/** A catering page is indexable only when the owner answers it depends on exist. Otherwise it builds noindex. */
export const cateringReady = {
  quote: () => q4(),
  hub: () => q4() && q5(),
  smallFunctions: () => q4() && q5(),
  corporate: () => q4() && q5() && c.proofAnswered,
  events: () => q4() && q5() && q11q15(),
  weddings: () => q4() && q5() && q11q15(),
};

/** "Anna Nagar, Mogappair and Kilpauk" */
export const listText = (items: string[]): string =>
  items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

export function cateringServiceSchema(path: string, name: string, description: string, business = false) {
  return prune({
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': absUrl(`${path}#service`),
    name,
    serviceType: 'Catering',
    provider: { '@id': absUrl('/#restaurant') },
    areaServed: { '@type': 'City', name: facts.city },
    audience: business ? { '@type': 'BusinessAudience' } : undefined,
    url: absUrl(path),
    description,
  });
}

export const CATERING_CRUMB = { name: 'Catering', href: '/catering/' };
