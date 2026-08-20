import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { TeacherProfileComponent } from './teacher-profile';
import { TeacherCatalogService } from '../../../../../core/Services/teacher-catalog.service';
import { TeacherProfile } from '../../../../../core/Models/Student/teacher-profile.model';

const MOCK_PROFILE: TeacherProfile = {
  id: 'teacher-1',
  firstName: 'أحمد',
  secondName: 'محمد',
  subject: 'الرياضيات',
  bio: 'مدرس رياضيات بخبرة تزيد عن ثماني سنوات.',
  imageUrl: null,
  featured: true,
  lessonsCount: 42,
  totalStudents: 1200,
  yearsOfExperience: 8,
  academicYears: [
    { id: 'y1', name: 'الصف الأول الثانوي' },
    { id: 'y2', name: 'الصف الثاني الثانوي' },
  ],
};

describe('TeacherProfileComponent', () => {
  let component: TeacherProfileComponent;
  let fixture: ComponentFixture<TeacherProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherProfileComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: TeacherCatalogService,
          useValue: { getTeacherProfile: () => of(MOCK_PROFILE) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherProfileComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'teacher-1');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the teacher profile view (dummy)', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;

    // Identity card
    expect(el.querySelector('h1')?.textContent).toContain('أحمد محمد');
    expect(el.textContent).toContain('الرياضيات');
    expect(el.textContent).toContain('مدرس رياضيات');
    expect(el.textContent).toContain('مميز');

    // Stats card
    expect(el.textContent).toContain('42');
    expect(el.textContent).toContain('1200');
    expect(el.textContent).toContain('8');

    // Academic years timeline
    expect(el.textContent).toContain('الصف الأول الثانوي');
    expect(el.textContent).toContain('الصف الثاني الثانوي');

    // Actions
    expect(el.textContent).toContain('تصفح دروس المدرس');
  });
});
