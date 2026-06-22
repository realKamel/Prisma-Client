import {
  AssignmentRow,
  ExamRow,
  GradingQuestion,
  Lesson,
  QuestionType,
  SubmissionRow,
} from '../../Models/Teacher/teacher-exams-model';

/** Fallback lesson list — used only if no lessons came from the backend */
export const MOCK_LESSONS: Lesson[] = [
  { id: 1, title: 'الكهرباء الساكنة' },
  { id: 2, title: 'القوة والحركة' },
  { id: 3, title: 'الموجات الصوتية' },
  { id: 4, title: 'المغناطيسية' },
  { id: 5, title: 'الطاقة الميكانيكية' },
  { id: 6, title: 'الضوء والبصريات' },
];

const STUDENT_NAMES = [
  'خالد حسن محمود',
  'نور محمد إبراهيم',
  'سامي وليد عمر',
  'دينا وليد سامي',
  'أحمد طارق فريد',
  'ياسمين سعد عادل',
  'مريم أشرف كمال',
  'عمر هشام صلاح',
];

const EXAM_TITLES = [
  'اختبار دوري: مراجعة الفصل الثاني',
  'اختبار دوري: منتصف الفصل الثاني',
  'اختبار دوري: مراجعة الفصل الأول',
  'اختبار دوري: اختبار شهر مارس',
];

const SUBMIT_DATES = ['أمس', 'اليوم', '٢ يونيو', '١ يونيو', '٣١ مايو', '١٥ مايو'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMockExams(count = 4): ExamRow[] {
  return Array.from({ length: count }, (_, i) => {
    const status = Math.random() > 0.5 ? 'sent' : 'done';
    const isDone = status === 'done';
    return {
      id: i + 1,
      title: EXAM_TITLES[i % EXAM_TITLES.length],
      date: `${randInt(1, 28)} مايو ٢٠٢٦`,
      students: randInt(24, 30),
      pending: isDone ? 0 : randInt(0, 6),
      avg: Math.random() > 0.15 ? randInt(55, 95) : null,
      status,
    };
  });
}

export function generateMockSubmissions(count = 6, kind: 'quiz' | 'exam' = 'quiz'): SubmissionRow[] {
  const typesPool: QuestionType[][] = [['mcq'], ['tf'], ['mcq', 'written'], ['mcq', 'tf', 'written']];
  return Array.from({ length: count }, (_, i) => {
    const isGraded = Math.random() > 0.5;
    const qtypes = pick(typesPool);
    const hasWritten = qtypes.includes('written');
    return {
      id: `${kind}-${i + 1}`,
      student: pick(STUDENT_NAMES),
      context: kind === 'quiz' ? pick(MOCK_LESSONS).title : pick(EXAM_TITLES),
      qtypes,
      submitted: pick(SUBMIT_DATES),
      score: isGraded ? randInt(50, 95) : null,
      status: isGraded ? (hasWritten ? 'graded' : 'auto') : 'pending',
      pendingWritten: !isGraded && hasWritten ? randInt(1, 3) : 0,
    };
  });
}

export function generateMockAssignments(count = 5): AssignmentRow[] {
  const exts = ['pdf', 'docx'];
  return Array.from({ length: count }, (_, i) => {
    const graded = Math.random() > 0.5;
    const ext = pick(exts);
    return {
      id: `a${i + 1}`,
      student: pick(STUDENT_NAMES),
      lesson: pick(MOCK_LESSONS).title,
      file: `homework_${i + 1}.${ext}`,
      size: `${(Math.random() * 2 + 0.3).toFixed(1)} م.ب`,
      submitted: pick(SUBMIT_DATES),
      score: graded ? randInt(60, 100) : null,
      status: graded ? 'graded' : 'pending',
    };
  });
}

/** Sample question set used inside the grading modal until real submission
 *  answers are wired up to the backend. */
export function generateMockGradingQuestions(kind: 'quiz' | 'exam'): GradingQuestion[] {
  if (kind === 'quiz') {
    return [
      {
        num: 1,
        type: 'mcq',
        text: 'ما هي وحدة قياس الشحنة الكهربائية؟',
        options: ['كولوم', 'أمبير', 'فولت', 'أوم'],
        correctIndex: 0,
        studentAnsIndex: 0,
      },
      {
        num: 2,
        type: 'tf',
        text: 'الإلكترونات تتحرك من القطب الموجب إلى السالب.',
        correctBool: false,
        studentAnsBool: true,
      },
      {
        num: 3,
        type: 'written',
        text: 'اشرح قانون كولوم بكلماتك الخاصة.',
        studentAnswer:
          'قانون كولوم بيقول إن القوة بين شحنتين بتكون متناسبة مع حاصل ضرب الشحنتين ومتناسبة عكسياً مع مربع المسافة بينهم.',
        maxScore: 20,
      },
    ];
  }
  return [
    {
      num: 1,
      type: 'mcq',
      text: 'ما قانون نيوتن الثاني للحركة؟',
      options: ['F=ma', 'E=mc²', 'PV=nRT', 'F=kq₁q₂/r²'],
      correctIndex: 0,
      studentAnsIndex: 0,
    },
    {
      num: 2,
      type: 'tf',
      text: 'الجسم الساكن يظل ساكناً ما لم تؤثر عليه قوة.',
      correctBool: true,
      studentAnsBool: true,
    },
    {
      num: 3,
      type: 'mcq',
      text: 'وحدة الطاقة في النظام الدولي هي:',
      options: ['وات', 'جول', 'نيوتن', 'باسكال'],
      correctIndex: 1,
      studentAnsIndex: 2,
    },
    {
      num: 4,
      type: 'written',
      text: 'فسّر لماذا يزداد تسارع الجسم عند تقليل كتلته مع ثبات القوة.',
      studentAnswer:
        'لأن التسارع يساوي القوة مقسومة على الكتلة. لما الكتلة بتقل والقوة ثابتة، النسبة بتكبر وبالتالي التسارع بيزيد.',
      maxScore: 20,
    },
  ];
}

import { AcademicYear } from '../../Models/Teacher/teacher-exams-model';

export const MOCK_ACADEMIC_YEARS: AcademicYear[] = [
  { id: 1, label: '٢٠٢٣ / ٢٠٢٤' },
  { id: 2, label: '٢٠٢٤ / ٢٠٢٥' },
  { id: 3, label: '٢٠٢٥ / ٢٠٢٦' },
];