import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AddLessonPageComponent } from './add-lesson-page.component';
import { LessonStepperComponent } from './components/lesson-stepper/lesson-stepper';

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

  beforeEach(async () => {
    vi.stubGlobal('localStorage', createStorageMock());

    await TestBed.configureTestingModule({
      imports: [AddLessonPageComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddLessonPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
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

  it('shows the videos step once the details are valid', () => {
    const form = (component as unknown as { detailsForm: FormGroup }).detailsForm;
    const outcomes = form.get('outcomes') as FormArray;
    outcomes.at(0).setValue('نتيجة تعلّم');
    (form.get('academicYearIds') as FormArray).push(new FormControl(1));
    form.patchValue({
      title: 'درس تجريبي عن الكهرباء',
      price: 100,
      currency: 'EGP',
      validityDurationInSeconds: 3600,
    });

    buttonByText('التالي').click();
    fixture.detectChanges();

    expect(stepper().selectedIndex).toBe(1);

    const videosStep = fixture.nativeElement.querySelector(
      'app-chapter-videos-step',
    ) as HTMLElement | null;
    expect(videosStep?.closest('[hidden]')).toBeNull();
  });
});
