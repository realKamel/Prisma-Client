export type CourseStatus = 'avail' | 'purchased' | 'locked' | 'expired';

export interface Course {
  id: number; 
  title: string; 
  teacherName: string; 
  teacherInitial: string; 
  subject: string; 
  durationHours: number; 
  status: CourseStatus; 
  price?: number;         
  prerequisiteLabel?: string; 
  expiredDate?: string;   
  iconSvg?: string;       
  currency: string;
}

// Static fallback data (Shows if backend is empty or down)
export const STATIC_COURSES: Course[] = [
  {
    id: 1, title: 'الكهرباء الساكنة — قانون كولوم', teacherName: 'أ. فاطمة علي', teacherInitial: 'ف', 
    subject: 'فيزياء', status: 'avail', price: 50, currency: 'جنيه', durationHours: 4,
    iconSvg: `<svg viewBox="0 0 24 24" fill="none"><path d="M6.19 11.39L12.19 3.31C12.66 2.67 13.54 3.07 13.54 3.91V10.17C13.54 10.67 13.88 11.08 14.31 11.08H17.22C17.89 11.08 18.24 12.01 17.80 12.60L11.80 20.68C11.33 21.32 10.45 20.92 10.45 20.08V13.82C10.45 13.32 10.11 12.91 9.68 12.91H6.77C6.10 12.91 5.75 11.98 6.19 11.39Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  {
    id: 2, title: 'حركة الأجسام — قوانين نيوتن', teacherName: 'أ. فاطمة علي', teacherInitial: 'ف', 
    subject: 'فيزياء', status: 'purchased', currency: 'جنيه', durationHours: 3,
    iconSvg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
  },
  {
    id: 3, title: 'الدوائر الكهربية — قانون أوم', teacherName: 'أ. فاطمة علي', teacherInitial: 'ف', 
    subject: 'فيزياء', status: 'locked', currency: 'جنيه', durationHours: 4, 
    prerequisiteLabel: 'تحتاج لإكمال الدرس السابق',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="1.5"/></svg>`
  },
  {
    id: 4, title: 'الموجات الكهرومغناطيسية', teacherName: 'أ. فاطمة علي', teacherInitial: 'ف', 
    subject: 'فيزياء', status: 'expired', currency: 'جنيه', durationHours: 4, 
    expiredDate: 'انتهت صلاحيتك · انتهت في ١٢ مارس',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 8v4M12 16h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
  }
];