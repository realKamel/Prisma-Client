import { ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { ContactLinks, ContactPlatform } from '../../../../models/my-profile.model';

export interface ContactPlatformMeta {
  key: ContactPlatform;
  icon: string;
  labelKey: string;
  placeholder: string;
}

const L = 'TEACHER_PROFILE_PAGE.LINKS.';

export const CONTACT_PLATFORMS: readonly ContactPlatformMeta[] = [
  { key: 'whatsapp', icon: 'bootstrapWhatsapp', labelKey: `${L}WHATSAPP`, placeholder: '01012345678' },
  { key: 'facebook', icon: 'bootstrapFacebook', labelKey: `${L}FACEBOOK`, placeholder: 'facebook.com/yourpage' },
  { key: 'instagram', icon: 'bootstrapInstagram', labelKey: `${L}INSTAGRAM`, placeholder: 'instagram.com/yourname' },
  { key: 'youtube', icon: 'bootstrapYoutube', labelKey: `${L}YOUTUBE`, placeholder: 'youtube.com/@yourchannel' },
  { key: 'telegram', icon: 'bootstrapTelegram', labelKey: `${L}TELEGRAM`, placeholder: 't.me/yourname' },
  { key: 'tiktok', icon: 'bootstrapTiktok', labelKey: `${L}TIKTOK`, placeholder: 'tiktok.com/@yourname' },
  { key: 'website', icon: 'bootstrapGlobe', labelKey: `${L}WEBSITE`, placeholder: 'https://example.com' },
];

const SITES: Record<Exclude<ContactPlatform, 'whatsapp' | 'website'>, { hosts: string[]; base: string }> = {
  facebook: { hosts: ['facebook.com', 'fb.com', 'fb.me'], base: 'https://facebook.com/' },
  instagram: { hosts: ['instagram.com'], base: 'https://instagram.com/' },
  youtube: { hosts: ['youtube.com', 'youtu.be'], base: 'https://youtube.com/' },
  telegram: { hosts: ['t.me', 'telegram.me'], base: 'https://t.me/' },
  tiktok: { hosts: ['tiktok.com'], base: 'https://tiktok.com/' },
};

/** Platforms whose profile URLs are written /@handle. */
const AT_HANDLE = new Set<ContactPlatform>(['youtube', 'tiktok']);

const EG_MOBILE = /^01[0125]\d{8}$/;
const HANDLE = /^@?[A-Za-z0-9._-]{2,64}$/;
const MAX_LINK_LENGTH = 200;

export type LinkResult = { value: string | null } | { error: string };

/**
 * Accepts a username or a link and returns the canonical https URL (WhatsApp: digits only).
 * The backend must repeat these checks: this only makes the form friendlier.
 */
export function normalizeLink(platform: ContactPlatform, raw: string | null | undefined): LinkResult {
  const text = (raw ?? '').trim();
  if (!text) return { value: null };

  if (platform === 'whatsapp') {
    const digits = text.replace(/[\s-]/g, '');
    return EG_MOBILE.test(digits) ? { value: digits } : { error: 'VALIDATION.EGYPTIAN_MOBILE' };
  }

  if (text.length > MAX_LINK_LENGTH) return { error: 'VALIDATION.LINK_INVALID' };

  const looksLikeUrl =
    platform === 'website' || /^(https?:\/\/|www\.)/i.test(text) || text.includes('/');

  if (!looksLikeUrl) {
    if (!HANDLE.test(text)) return { error: 'VALIDATION.LINK_INVALID' };
    const { base } = SITES[platform];
    return { value: `${base}${AT_HANDLE.has(platform) ? '@' : ''}${text.replace(/^@/, '')}` };
  }

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return { error: 'VALIDATION.LINK_INVALID' };
  }

  if (url.protocol === 'http:') url.protocol = 'https:';
  if (url.protocol !== 'https:' || url.username || url.password) {
    return { error: 'VALIDATION.LINK_INVALID' };
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, '');

  if (platform === 'website') {
    return host.includes('.') ? { value: url.toString() } : { error: 'VALIDATION.LINK_INVALID' };
  }

  const matches = SITES[platform].hosts.some((h) => host === h || host.endsWith(`.${h}`));
  return matches ? { value: url.toString() } : { error: 'VALIDATION.LINK_WRONG_SITE' };
}

export const contactLinkValidator =
  (platform: ContactPlatform): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    const result = normalizeLink(platform, control.value);
    return 'error' in result ? { link: { key: result.error } } : null;
  };

/** Normalised links for the request body (invalid or empty values become null). */
export function toLinksPayload(raw: Partial<Record<ContactPlatform, string | null>>): ContactLinks {
  const links = {} as ContactLinks;
  for (const { key } of CONTACT_PLATFORMS) {
    const result = normalizeLink(key, raw[key]);
    links[key] = 'value' in result ? result.value : null;
  }
  return links;
}