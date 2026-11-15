/** Gradient presets for the public page. Stored by name; the backend enum uses the same names. */
export type ProfileColor =
  | 'ocean'
  | 'midnight'
  | 'violet'
  | 'teal'
  | 'emerald'
  | 'graphite'
  | 'rose'
  | 'sunset';

export const PROFILE_COLORS: readonly { key: ProfileColor; from: string; to: string }[] = [
  { key: 'ocean', from: '#0f4c81', to: '#1fa2c4' },
  { key: 'midnight', from: '#111555', to: '#3a47c9' },
  { key: 'violet', from: '#4b2fa0', to: '#9b5de5' },
  { key: 'teal', from: '#0b5c63', to: '#1f9d9a' },
  { key: 'emerald', from: '#0f5b3f', to: '#2fa36b' },
  { key: 'graphite', from: '#1f2937', to: '#4b5563' },
  { key: 'rose', from: '#a3174f', to: '#e85d8f' },
  { key: 'sunset', from: '#b8321f', to: '#f08a24' },
];

export const DEFAULT_PROFILE_COLOR: ProfileColor = 'ocean';

export function profileGradient(color: ProfileColor): string {
  const preset = PROFILE_COLORS.find((c) => c.key === color) ?? PROFILE_COLORS[0];
  return `linear-gradient(135deg, ${preset.from} 0%, ${preset.to} 100%)`;
}

export type ContactPlatform =
  | 'whatsapp'
  | 'facebook'
  | 'instagram'
  | 'youtube'
  | 'telegram'
  | 'tiktok'
  | 'website';

export type ContactLinks = Record<ContactPlatform, string | null>;

export interface ProfileVisibility {
  showYearsOfExperience: boolean;
  showContactLinks: boolean;
  showStudentsCount: boolean;
  showLessonsCount: boolean;
  showPopularLessons: boolean;
}

export interface ProfilePicture {
  /** Download link for the picture students see, or null when there is none. */
  url: string | null;
}

export interface PopularLesson {
  id: string;
  title: string;
  studentsCount: number;
}

/** Computed server-side; shown to the teacher next to the visibility toggles. */
export interface ProfileStats {
  studentsCount: number;
  lessonsCount: number;
  popularLessons: PopularLesson[];
}

export interface MyProfile {
  firstName: string;
  secondName: string;
  thirdName: string;
  lastName: string;
  subject: string;
  bio: string | null;
  yearsOfExperience: number | null;
  color: ProfileColor;
  links: ContactLinks;
  visibility: ProfileVisibility;
  announcementText: string | null;
  announcementEndsAt: string | null;
  picture: ProfilePicture;
  stats: ProfileStats;
}

export interface UpdateMyProfileRequest
  extends Omit<MyProfile, 'picture' | 'stats'> {
  removePicture: boolean;
}

export interface PictureUploadRequest {
  fileName: string;
  contentType: string;
  size: number;
}

export interface PictureUploadLink {
  fileId: string;
  uploadUrl: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}