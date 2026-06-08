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
