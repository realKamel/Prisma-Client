import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AddLessonPageComponent } from './add-lesson-page.component';
import { LessonStepperComponent } from './components/lesson-stepper/lesson-stepper';
import { ChapterRow } from './models/chapter-row.model';
import { createChapterVideoUpload } from './models/chapter-video-upload.model';

/** The auth store writes to `localStorage`, which the Node test environment does not provide. */
function createStorageMock(): Storage {
  const items = new Map<string, string>();

  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => void items.delete(key),
    setItem: (key, value) => void items.set(key, value),
  };
}

describe('AddLessonPageComponent', () => {
  let component: AddLessonPageComponent;
  let fixture: ComponentFixture<AddLessonPageComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    vi.stubGlobal('localStorage', createStorageMock());

    await TestBed.configureTestingModule({
      imports: [AddLessonPageComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(AddLessonPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    // Page options fetched on init.
    httpTesting
      .match((request) => request.url.endsWith('/Lessons/options'))
      .forEach((request) =>
        request.flush({ prerequisitesOptions: [], allAcademicYearsOptions: [] }),
      );
    httpTesting
      .match((request) => request.url.includes('academic-year-options'))
      .forEach((request) => request.flush([]));
  });

  afterEach(() => {
    httpTesting.verify();
    vi.unstubAllGlobals();
  });

  function stepper(): LessonStepperComponent {
    return fixture.debugElement.query(By.directive(LessonStepperComponent))
      .componentInstance as LessonStepperComponent;
  }

  function buttonByText(text: string): HTMLButtonElement {
    const buttons = [...fixture.nativeElement.querySelectorAll('button')] as HTMLButtonElement[];
    const button = buttons.find((element) => element.textContent?.includes(text));
    if (!button) throw new Error(`No button containing "${text}"`);
    return button;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders both step headers and keeps the videos step hidden until it is reachable', () => {
    expect(fixture.nativeElement.querySelectorAll('nav button').length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('بيانات الدرس');

    const videosStep = fixture.nativeElement.querySelector(
      'app-chapter-videos-step',
    ) as HTMLElement | null;
    expect(videosStep?.closest('[hidden]')).toBeTruthy();
  });

  it('does not advance to the videos step while the details are invalid', () => {
    buttonByText('التالي').click();
    fixture.detectChanges();

    expect(stepper().selectedIndex).toBe(0);
  });

  it('binds the details section to the nested info group', () => {
    const form = (component as unknown as { detailsForm: FormGroup }).detailsForm;
    const title = fixture.nativeElement.querySelector('#title') as HTMLInputElement;

    title.value = 'درس جديد عن الكهرباء';
    title.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(form.get('info.title')?.value).toBe('درس جديد عن الكهرباء');
    expect(form.get('title')).toBeNull();
  });

  it('binds the assignment section to the nested assignment group', () => {
    const form = (component as unknown as { detailsForm: FormGroup }).detailsForm;
    const toggle = fixture.nativeElement.querySelector(
      '[role="switch"]',
    ) as HTMLButtonElement | null;

    toggle?.click();
    fixture.detectChanges();

    expect(form.get('assignment.assignmentEnabled')?.value).toBe(true);
  });

  it('shows the videos step once the details are valid', () => {
    const form = (component as unknown as { detailsForm: FormGroup }).detailsForm;
    const outcomes = form.get('outcomes') as FormArray;
    outcomes.at(0).setValue('نتيجة تعلّم');
    (form.get('academicYearIds') as FormArray).push(new FormControl(1));
    form.patchValue({
      info: {
        title: 'درس تجريبي عن الكهرباء',
        price: 100,
        currency: 'EGP',
        validityDurationInSeconds: 3600,
      },
    });

    buttonByText('التالي').click();
    fixture.detectChanges();

    expect(stepper().selectedIndex).toBe(1);

    const videosStep = fixture.nativeElement.querySelector(
      'app-chapter-videos-step',
    ) as HTMLElement | null;
    expect(videosStep?.closest('[hidden]')).toBeNull();
  });

  it('requires a grade while the assignment is enabled', () => {
    const form = (component as unknown as { detailsForm: FormGroup }).detailsForm;
    const assignment = form.get('assignment') as FormGroup;

    assignment.get('assignmentEnabled')!.setValue(true);
    assignment.patchValue({
      assignmentDueDate: '2026-11-01',
      assignmentFileName: 'assignment.pdf',
    });

    expect(assignment.get('assignmentGrade')?.valid).toBe(false);

    assignment.get('assignmentGrade')!.setValue(10);
    expect(assignment.get('assignmentGrade')?.valid).toBe(true);
  });

  it('creates the lesson through v2 and requests one section per chapter', async () => {
    const form = (component as unknown as { detailsForm: FormGroup }).detailsForm;
    (form.get('outcomes') as FormArray).at(0).setValue('نتيجة تعلّم');
    (form.get('academicYearIds') as FormArray).push(new FormControl(1));
    form.patchValue({
      info: {
        title: 'درس تجريبي عن الكهرباء',
        price: 100,
        currency: 'EGP',
        validityDurationInSeconds: 3600,
      },
    });

    // A completed row needs no real upload, so the pipeline runs without TUS.
    const rows = (component as unknown as { chapterRows: WritableSignal<ChapterRow[]> })
      .chapterRows;
    rows.set([
      {
        key: 'chapter-1',
        name: 'الفصل الأول',
        upload: { ...createChapterVideoUpload(), status: 'done' },
      },
    ]);

    buttonByText('نشر الدرس').click();
    fixture.detectChanges();

    const create = httpTesting.expectOne('/api/v1/Lessons/v2');
    expect(create.request.body).toMatchObject({
      title: 'درس تجريبي عن الكهرباء',
      price: 100,
      currency: 'EGP',
      assignmentEnabled: false,
      assignmentGrade: null,
      academicYearIds: ['1'],
      outcomes: ['نتيجة تعلّم'],
      validityDurationInSeconds: 3600,
    });
    create.flush({
      lessonId: 'lesson-guid',
      coverUploadUrl: 'https://storage.test/cover',
      assignmentUploadUrl: null,
    });

    await tick();
    fixture.detectChanges();

    const sections = httpTesting.expectOne('/api/v1/Lessons/lesson-guid/sections');
    expect(sections.request.body.sections).toEqual([
      { name: 'الفصل الأول', videoDurationSeconds: 0 },
    ]);
    sections.flush([{ sectionId: 10, chapterIndex: 0 }]);

    await tick();
    fixture.detectChanges();
  });
});

/** Lets pending promise chains (the publish pipeline) settle. */
function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
