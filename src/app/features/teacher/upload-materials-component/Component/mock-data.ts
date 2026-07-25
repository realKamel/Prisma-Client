import { Lesson, UploadedFile } from "./upload-page.types";


// TODO: replace with the teacher's real lesson list from the API
export const MOCK_LESSONS: Lesson[] = [
  { id: 1, title: 'الكهرباء الساكنة' },
  { id: 2, title: 'الحركة المتسارعة' },
  { id: 3, title: 'الموجات الصوتية' },
  { id: 4, title: 'المغناطيسية' },
  { id: 5, title: 'الطاقة الميكانيكية' },
  { id: 6, title: 'الضغط والسوائل' },
  { id: 7, title: 'الثرموديناميكا' },
  { id: 8, title: 'البصريات الهندسية' },
];

// TODO: replace with the real "files by lesson" API response
export const MOCK_FILES_BY_LESSON: Record<number, UploadedFile[]> = {
  1: [
    { id: 1, name: 'كتاب الكهرباء الساكنة.pdf', type: 'pdf', size: '٣.٢ ميجا', date: 'منذ ٣ أيام' },
    { id: 2, name: 'ملخص قانون كولوم.pdf', type: 'pdf', size: '١.١ ميجا', date: 'منذ ٣ أيام' },
    { id: 3, name: 'شرح المجال الكهربائي.mp4', type: 'vid', size: '٢٤٠ ميجا', date: 'منذ أسبوع' },
    { id: 4, name: 'بوربوينت الكهرباء الساكنة.pptx', type: 'ppt', size: '٨.٤ ميجا', date: 'منذ أسبوع' },
  ],
  2: [
    { id: 5, name: 'قوانين نيوتن — الملخص.pdf', type: 'pdf', size: '٢.٨ ميجا', date: 'منذ يومين' },
    { id: 6, name: 'حل تدريبات الفصل الثالث.pdf', type: 'pdf', size: '١.٦ ميجا', date: 'منذ يومين' },
    { id: 7, name: 'الزخم ورد الفعل.mp4', type: 'vid', size: '١٨٥ ميجا', date: 'منذ أسبوع' },
  ],
  3: [
    { id: 8, name: 'الموجات الصوتية — مقدمة.pdf', type: 'pdf', size: '٢.٢ ميجا', date: 'منذ ٤ أيام' },
    { id: 9, name: 'تجربة الموجات المائية.mp4', type: 'vid', size: '٩٨ ميجا', date: 'منذ ٤ أيام' },
  ],
  4: [
    { id: 10, name: 'كتاب المغناطيسية كامل.pdf', type: 'pdf', size: '٥.١ ميجا', date: 'منذ ٥ أيام' },
    { id: 11, name: 'تجربة المغناطيس والحديد.mp4', type: 'vid', size: '٣١٠ ميجا', date: 'منذ ٥ أيام' },
    { id: 12, name: 'عرض الفصل الثاني.pptx', type: 'ppt', size: '٦.٧ ميجا', date: 'منذ أسبوع' },
  ],
};
