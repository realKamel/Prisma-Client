import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { AddLessonResponse } from '../../../../domain/lessons/models/lesson.model';
import { DeleteModalService } from '../../../../shared/components/delete-modal/delete-modal.service';
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
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        // The confirmation dialog is the app-wide one; tests accept it without opening a dialog.
        { provide: DeleteModalService, useValue: { confirmDelete: () => ({ closed: of(true) }) } },
      ],
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

  function rowsSignal(): WritableSignal<ChapterRow[]> {
    return (component as unknown as { chapterRows: WritableSignal<ChapterRow[]> }).chapterRows;
  }

  function chapterRows(): ChapterRow[] {
    return rowsSignal()();
  }

  function setRow(index: number, patch: Partial<ChapterRow>): void {
    rowsSignal().update((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    fixture.detectChanges();
  }

  function fillValidDetails(): void {
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
  }

  function goToVideosStep(): void {
    // Let the button pick up the form's validity before clicking it.
    fixture.detectChanges();
    buttonByText('التالي').click();
    fixture.detectChanges();
  }

  function startButton(): HTMLButtonElement {
    return buttonByText('بدء الرفع');
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

    // Let the submit button pick up the form's validity before clicking it.
    fixture.detectChanges();
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
        sectionId: null,
        videoId: null,
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
      // Passed through exactly as the academic-year options provide it.
      academicYearIds: [1],
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
    expect(sections.request.body).toEqual({
      title: 'الفصل الأول',
      videoDurationInSeconds: 0,
      isPreviewable: false,
    });
    sections.flush({
      sectionId: 'section-1',
      videoId: 'video-1',
      sectionSortOrder: 1,
      libraryId: 42,
      expirationTime: Math.floor(Date.now() / 1000) + 3600,
      signature: 'signature',
    });

    await tick();
    fixture.detectChanges();
  });

  it('creates a single section on demand for a chapter', async () => {
    fillValidDetails();
    // A file is required before the row can offer an upload, but creating a section doesn't upload.
    setRow(0, { name: 'الفصل الأول' });
    goToVideosStep();

    buttonByText('إنشاء القسم').click();
    fixture.detectChanges();

    const create = httpTesting.expectOne('/api/v1/Lessons/v2');
    create.flush({
      lessonId: 'lesson-guid',
      coverUploadUrl: 'https://storage.test/cover',
      assignmentUploadUrl: null,
    });

    await tick();
    fixture.detectChanges();

    const sections = httpTesting.expectOne('/api/v1/Lessons/lesson-guid/sections');
    expect(sections.request.body).toEqual({
      title: 'الفصل الأول',
      videoDurationInSeconds: 0,
      isPreviewable: false,
    });
    sections.flush({
      sectionId: 'section-guid',
      videoId: 'video-guid',
      sectionSortOrder: 1,
      libraryId: 42,
      expirationTime: Math.floor(Date.now() / 1000) + 3600,
      signature: 'signature',
    });

    await tick();
    fixture.detectChanges();

    expect(chapterRows()[0].sectionId).toBe('section-guid');
    expect(chapterRows()[0].videoId).toBe('video-guid');
    expect(chapterRows()[0].upload.credentials).toEqual({
      videoId: 'video-guid',
      libraryId: 42,
      expirationTime: expect.any(Number),
      signature: 'signature',
    });
    expect(fixture.nativeElement.textContent).toContain('الفصلجاهز');
  });

  it('renews an expired upload link for the video already attached to a section', async () => {
    fillValidDetails();
    setRow(0, {
      name: 'الفصل الأول',
      sectionId: 'section-guid',
      videoId: 'video-guid',
      upload: {
        ...createChapterVideoUpload(),
        credentials: {
          videoId: 'video-guid',
          libraryId: 42,
          expirationTime: Math.floor(Date.now() / 1000) - 10,
          signature: 'expired',
        },
      },
    });

    const internals = component as unknown as {
      lessonLinks: WritableSignal<AddLessonResponse | null>;
      resolveUploadCredentials(index: number): Promise<{ signature: string }>;
    };
    internals.lessonLinks.set({
      lessonId: 'lesson-guid',
      coverUploadUrl: 'https://storage.test/cover',
      assignmentUploadUrl: null,
    });

    const credentials = internals.resolveUploadCredentials(0);

    const renew = httpTesting.expectOne('/api/v1/lessons/lesson-guid/sections/section-guid');
    expect(renew.request.method).toBe('PATCH');
    expect(renew.request.body).toEqual({ videoId: 'video-guid' });
    renew.flush({
      sectionId: 'section-guid',
      videoId: 'video-guid',
      libraryId: 42,
      expirationTime: Math.floor(Date.now() / 1000) + 3600,
      signature: 'renewed',
    });

    await expect(credentials).resolves.toMatchObject({ signature: 'renewed' });
    expect(chapterRows()[0].upload.credentials?.signature).toBe('renewed');
  });

  it('blocks creating a section before the earlier chapters have one', () => {
    fillValidDetails();
    rowsSignal().set([
      {
        key: 'chapter-1',
        name: 'الفصل الأول',
        sectionId: null,
        videoId: null,
        upload: createChapterVideoUpload(),
      },
      {
        key: 'chapter-2',
        name: 'الفصل الثاني',
        sectionId: null,
        videoId: null,
        upload: createChapterVideoUpload(),
      },
    ]);
    goToVideosStep();

    const createButtons = [...fixture.nativeElement.querySelectorAll('button')].filter(
      (button: HTMLButtonElement) => button.textContent?.includes('إنشاء القسم'),
    ) as HTMLButtonElement[];

    expect(createButtons).toHaveLength(2);
    expect(createButtons[0].disabled).toBe(false);
    expect(createButtons[1].disabled).toBe(true);

    createButtons[1].click();
    fixture.detectChanges();

    // The page guard rejects the out-of-order request as well.
    httpTesting.expectNone('/api/v1/Lessons/v2');
  });

  it('deletes a chapter section on the server before dropping its row', async () => {
    fillValidDetails();
    rowsSignal().set([
      {
        key: 'chapter-1',
        name: 'الفصل الأول',
        sectionId: 'section-1',
        videoId: 'video-1',
        upload: createChapterVideoUpload(),
      },
      {
        key: 'chapter-2',
        name: 'الفصل الثاني',
        sectionId: 'section-2',
        videoId: 'video-2',
        upload: createChapterVideoUpload(),
      },
    ]);
    (
      component as unknown as { lessonLinks: WritableSignal<AddLessonResponse | null> }
    ).lessonLinks.set({
      lessonId: 'lesson-guid',
      coverUploadUrl: 'https://storage.test/cover',
      assignmentUploadUrl: null,
    });

    // The lesson exists, so the details are locked, but chapters can still be deleted.
    goToVideosStep();
    const removeButton = fixture.nativeElement.querySelector(
      '[aria-label="حذف الفصل 1"]',
    ) as HTMLButtonElement;
    removeButton.click();
    fixture.detectChanges();

    const remove = httpTesting.expectOne('/api/v1/lessons/lesson-guid/sections/section-1');
    expect(remove.request.method).toBe('DELETE');
    // The row stays on screen until the API confirms the delete.
    expect(chapterRows()).toHaveLength(2);

    remove.flush(null);
    await tick();
    fixture.detectChanges();

    expect(chapterRows()).toHaveLength(1);
    expect(chapterRows()[0].sectionId).toBe('section-2');
  });

  it('removes a chapter whose section was never created without calling the API', () => {
    fillValidDetails();
    rowsSignal().set([
      {
        key: 'chapter-1',
        name: 'الفصل الأول',
        sectionId: null,
        videoId: null,
        upload: createChapterVideoUpload(),
      },
      {
        key: 'chapter-2',
        name: 'الفصل الثاني',
        sectionId: null,
        videoId: null,
        upload: createChapterVideoUpload(),
      },
    ]);
    goToVideosStep();

    (
      fixture.nativeElement.querySelector('[aria-label="حذف الفصل 1"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    httpTesting.expectNone((request) => request.method === 'DELETE');
    expect(chapterRows()).toHaveLength(1);
    expect(chapterRows()[0].name).toBe('الفصل الثاني');
  });

  it('keeps the upload controls disabled until the section exists', () => {
    fillValidDetails();
    setRow(0, {
      name: 'الفصل الأول',
      upload: {
        ...createChapterVideoUpload(),
        file: new File(['x'], 'v.mp4', { type: 'video/mp4' }),
      },
    });
    goToVideosStep();

    expect(startButton().disabled).toBe(true);
    expect(buttonByText('إيقاف مؤقت').disabled).toBe(true);
    expect(buttonByText('متابعة الرفع').disabled).toBe(true);

    setRow(0, { sectionId: 'section-guid', videoId: 'video-guid' });

    expect(startButton().disabled).toBe(false);
  });
});

/** Lets pending promise chains (the publish pipeline) settle. */
function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
