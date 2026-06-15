export type QuizStatus = 'new' | 'pending' | 'done' | 'missed';

export interface Quiz {
    id: string;
    title: string;
    date: string;            // display string e.g. "١٥ مايو ٢٠٢٦"
    submittedDate?: string;  // for pending status
    questionCount?: number;
    durationMinutes?: number;
    status: QuizStatus;
    score?: number;          // 0–100, only when status === 'done'
    maxScore?: number;       // defaults to 100
    posterVariant: 'pp-energy' | 'pp-magnet' | 'pp-wave' | 'pp-atom' | 'pp-thermo' | 'pp-optics';
    iconType: 'bolt' | 'atom' | 'trophy' | 'magnet' | 'thermo' | 'eye';
}

export interface QuizStats {
    total: number;
    avgScore: number;   // percentage 0–100
    bestScore: number;  // percentage 0–100
    newCount: number;
}