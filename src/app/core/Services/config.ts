import { inject, Service, signal } from '@angular/core';
import { PlatformConfig } from '../Models/platform-config';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, firstValueFrom, tap, throwError, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { toast } from 'ngx-sonner';
import { IProblemDetails } from '../Models/problemDetails';

@Service()
export class ConfigService {
  private http = inject(HttpClient);
  private readonly defaultConfig: PlatformConfig = {
    hero: {
      tag: ' مفتوح الآن للتسجيل · العام الدراسي ٢٠٢٥-٢٠٢٦',
      title: 'الفهم الحقيقي يبدأ من هنا',
      badges: [
        {
          icon: 'bootstrapPatchCheckFill',
          text: 'درجة كاملة',
        },
        {
          icon: 'bootstrapCalendarCheck',
          text: 'درسك الجاي جاهز',
        },
        {
          icon: 'bootstrapLightningCharge',
          text: '٢٤٨ طالب نشط',
        },
        {
          icon: 'bootstrapStarFill',
          text: 'تقييم ٥ من ٥',
        },
      ],
      subtitle:
        'منصة تعليمية ممتعة مع معلم واحد متخصص — دروس واضحة، كويزات تفاعلية، ومتابعة أولياء الأمور لحظة بلحظة.',
      ctaPrimary: 'سجّل مجاناً — ابدأ دلوقتي',
      ctaSecondary: 'شوف الدروس المتاحة',
      teacherImage: 'https://cdn-icons-png.flaticon.com/512/9721/9721084.png',
    },
    navLogo: {
      logoLetter: 'م',
      teacherName: 'محمد أحمد',
      platformName: 'بريزما أكاديمي',
    },
    reviews: [
      {
        id: 1,
        body: 'ابني كان بيكره المذاكرة، دلوقتي بيطالب بالدرس الجديد بنفسه! التقارير الأسبوعية حاجة تانية خالص.',
        name: 'أم أحمد',
        role: 'ولي أمر · الصف الثالث الإعدادي',
        stars: '★★★★★',
        avatar: 'أ',
      },
      {
        id: 2,
        body: 'الدروس واضحة جداً والكويزات بتساعدني أعرف فين ضعفي بالظبط. ربحت في الامتحانات!',
        name: 'محمد الطالب',
        role: 'طالب · الصف الأول الثانوي',
        stars: '★★★★★',
        avatar: 'م',
      },
      {
        id: 3,
        body: 'أنا بسافر كتير وكنت مش قادرة أتابع. دلوقتي التقارير بتيجي على واتساب وعارفة كل حاجة!',
        name: 'أم فاطمة',
        role: 'ولي أمر · الصف الثاني الثانوي',
        stars: '★★★★★',
        avatar: 'ف',
      },
    ],
    miniQuiz: {
      id: 4,
      correct: 2,
      options: [
        {
          id: 1,
          label: 'نيوتن',
        },
        {
          id: 2,
          label: 'باسكال',
        },
        {
          id: 3,
          label: 'جول',
        },
      ],
      question: 'ما هي وحدة قياس الضغط؟',
    },
  };
  readonly config = signal<PlatformConfig | null>(this.defaultConfig);
  readonly errorMessage = signal<string | null>(null);

  async loadAsync() {
    return firstValueFrom(
      this.http
        .get<PlatformConfig>(`${environment.apiUrl}/LandingPage/export/${environment.teacherEmail}`)
        .pipe(
          timeout(10_000),
          tap((data) => {
            this.config.set(data);
            this.errorMessage.set(null); // Clear any old errors on success
          }),
          catchError((err: HttpErrorResponse) => {
            // All HTTP errors (4xx, 5xx, timeouts) land here!
            const problem = err.error as IProblemDetails | undefined;
            const userFriendlyMsg =
              problem?.detail || problem?.title || 'حدث خطأ، يرجى المحاولة لاحقاً';

            toast.error(userFriendlyMsg);
            this.errorMessage.set(userFriendlyMsg);

            return throwError(() => err);
          }),
        ),
    );
  }
}
