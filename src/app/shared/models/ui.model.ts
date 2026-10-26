/** Generic filter option used in filter-chip components */
export interface Filter<T = string> {
  key: T;
  label: string;
}

/** Day-of-week tracking for student dashboard greeting */
export interface WeekDay {
  label: string;
  done: boolean;
  isToday: boolean;
}

/** Contact-us page — experience entry */
export interface Experience {
  role: string;
  place: string;
  years: string;
  duration: string;
}

/** Contact-us page — social-media link */
export interface SocialLink {
  icon: string;
  label: string;
  href: string;
}

/** Generic server-side validation errors shape */
export interface ServerErrors {
  email?: string;
  mobile?: string;
  general?: string;
}

/** Testimonial / review entry */
export interface Review {
  stars: string;
  body: string;
  avatar: string;
  name: string;
  role: string;
}
