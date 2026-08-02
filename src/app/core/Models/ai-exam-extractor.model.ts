import { QuestionType } from '../enums/question-type';

/** A single choice within an extracted (AI) question */
export interface ExtractedChoiceDto {
  text: string;
  isCorrect: boolean;
}

/** A question extracted by the AI from a PDF / file */
export interface ExtractedQuestionDto {
  text: string;
  type: QuestionType;
  degree: number;
  choices?: ExtractedChoiceDto[];
  modelAnswer?: string;
  isCorrect?: boolean;
}

/** Progress / status update emitted during AI extraction */
export interface ExtractionUpdate {
  state: string;
  progress: number;
  phase: string;
  error?: string;
  currentQuestion?: ExtractedQuestionDto | null;
  completedQuestions: ExtractedQuestionDto[];
}
