export interface Badge {
  icon: string;
  text: string;
}

export interface NavLogoConfig {
  teacherName: string;
  platformName: string;
  logoLetter: string;
}

export interface HeroConfig {
  tag: string;
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  teacherImage: string;
  badges: Badge[];
}

export interface Review {
  /** "★" | "★★" | "★★★" | "★★★★" | "★★★★★" **/
  id: number;
  stars: string;
  body: string;
  avatar: string;
  name: string;
  role: string;
}

export interface Testimonial {
  reviews: Review[];
}

export interface QuizOption {
  id: number;
  label: string;
}

export interface MiniQuiz {
  id: number;
  question: string;
  options: QuizOption[];
  correct: number;
}

export interface PlatformConfig {
  navLogo: NavLogoConfig;
  hero: HeroConfig;
  miniQuiz: MiniQuiz;
  reviews: Review[];
}
