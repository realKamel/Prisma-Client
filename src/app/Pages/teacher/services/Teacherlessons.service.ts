import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LessonStatus, TeacherLesson } from '../models/Teacherlesson.model';

const MOCK_LESSONS: TeacherLesson[] = [
  { id: 1, name: 'الكهرباء الساكنة — قانون كولوم',  price: 50, students: 64, status: 'active' },
  { id: 2, name: 'قوانين نيوتن للحركة',              price: 50, students: 51, status: 'active' },
  { id: 3, name: 'الموجات الصوتية',                  price: 50, students: 38, status: 'active' },
  { id: 4, name: 'المغناطيسية والكهرومغناطيسية',     price: 50, students: 29, status: 'active' },
  { id: 5, name: 'الطاقة الميكانيكية والشغل',        price: 50, students: 22, status: 'hidden' },
  { id: 6, name: 'الضغط والسوائل',                   price: 50, students: 17, status: 'active' },
  { id: 7, name: 'الثرموديناميكا الأساسية',           price: 60, students: 14, status: 'draft'  },
  { id: 8, name: 'البصريات الهندسية',                 price: 50, students: 11, status: 'active' },
  { id: 9, name: 'الذرة والفيزياء الحديثة',           price: 60, students: 0,  status: 'draft'  },
];

@Injectable({ providedIn: 'root' })
export class TeacherLessonsService {
  private lessonsSubject = new BehaviorSubject<TeacherLesson[]>([...MOCK_LESSONS]);
  lessons$: Observable<TeacherLesson[]> = this.lessonsSubject.asObservable();

  getAll(): TeacherLesson[] {
    return this.lessonsSubject.getValue();
  }

  toggleStatus(id: number): void {
    const lessons = this.lessonsSubject.getValue().map(l => {
      if (l.id !== id) return l;
      const next: LessonStatus = l.status === 'hidden' ? 'active' : 'hidden';
      return { ...l, status: next };
    });
    this.lessonsSubject.next(lessons);
  }

  delete(id: number): void {
    this.lessonsSubject.next(
      this.lessonsSubject.getValue().filter(l => l.id !== id)
    );
  }

  filter(query: string, status: string): TeacherLesson[] {
    const q = query.trim().toLowerCase();
    return this.getAll().filter(l => {
      const matchQ = !q || l.name.includes(q);
      const matchS = status === 'all' || l.status === status;
      return matchQ && matchS;
    });
  }
}