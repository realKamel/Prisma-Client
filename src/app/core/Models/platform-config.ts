export interface Badge {
  icon: string;
  text: string;
}

export interface HeroConfig {
  tag: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  teacherImage: string;
  badges: Badge[];
}

export interface NavLogoConfig {
  teacherName: string;
  platformName: string;
  logoLetter: string;
}

export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
  correct: string;
}

export interface Testimonial {
  /** "★" | "★★" | "★★★" | "★★★★" | "★★★★★" **/
  stars: string;
  body: string;
  avatar: string;
  name: string;
  role: string;
}

export interface PlatformConfig {
  navLogo: NavLogoConfig;
  hero: HeroConfig;
  reviews: Testimonial[]; 
  quiz: QuizQuestion[];    
}