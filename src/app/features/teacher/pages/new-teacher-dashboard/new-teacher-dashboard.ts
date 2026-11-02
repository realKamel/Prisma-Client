import { DOCUMENT, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexStates,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ChartComponent,
} from 'ng-apexcharts';
import { map } from 'rxjs';
import { AuthStore } from '../../../../core/stores/auth.store';
import { CountUpDirective } from '../../../../shared/directives/count-up/count-up.directive';
import { Action, EarningEntry } from './models/dashboard.model';
import { TeacherStore } from './stores/teacher-store';

type Range = 7 | 30;
type ActivityTab = 'sales' | 'mine';

interface Task {
  id: string;
  count: number;
  label: string; // translation key
  cta: string; // translation key
  route: string;
}

const T = 'TEACHER_DASHBOARD_PAGE';

@Component({
  selector: 'app-teacher-dashboard',
  imports: [
    DecimalPipe,
    RouterLink,
    TranslatePipe,
    NgmMotionDirective,
    CountUpDirective,
    ChartComponent,
  ],
  templateUrl: './new-teacher-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewTeacherDashboardComponent implements OnInit {
  protected readonly teacherStore = inject(TeacherStore);
  protected readonly authStore = inject(AuthStore);
  private readonly translate = inject(TranslateService);
  private readonly root = inject(DOCUMENT).documentElement;

  protected readonly firstName = computed(() => this.authStore.user()?.firstName);
  protected readonly secondName = computed(() => this.authStore.user()?.secondName);

  // TODO: point these at your real routes (one place to change).
  private readonly routes = {
    assignments: '/dashboard/grading/assignments',
    quizzes: '/dashboard/grading/quizzes',
    messages: '/dashboard/messages',
    lessons: '/dashboard/mylessons',
  };

  // ---- Locale helpers ---------------------------------------------------------------------------
  private readonly locale = this.root.lang.startsWith('en') ? 'en-US' : 'ar-EG';
  private readonly numberFmt = new Intl.NumberFormat(this.locale);
  private readonly pointDateFmt = new Intl.DateTimeFormat(this.locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  private readonly shortDateFmt = new Intl.DateTimeFormat(this.locale, {
    day: 'numeric',
    month: 'short',
  });
  private readonly relativeFmt = new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' });

  // ---- UI state ---------------------------------------------------------------------------------
  protected readonly ranges: readonly Range[] = [7, 30];
  protected readonly range = signal<Range>(30);
  protected readonly tab = signal<ActivityTab>('sales');

  protected readonly rangeLabel = computed(() => this.numberFmt.format(this.range()));

  // ---- Earnings: everything derives from the same 60-day series --------------------------------
  private readonly daily = computed<EarningEntry[]>(
    () => this.teacherStore.earnings()?.daily ?? [],
  );

  private readonly periods = computed(() => {
    const all = this.daily();
    const n = this.range();
    return { current: all.slice(-n), previous: all.slice(-2 * n, -n) };
  });

  protected readonly totals = computed(() => {
    const { current, previous } = this.periods();
    const earning = NewTeacherDashboardComponent.sum(current, 'earning');
    return {
      earning,
      earningDelta: NewTeacherDashboardComponent.percentChange(
        earning,
        NewTeacherDashboardComponent.sum(previous, 'earning'),
      ),
      enrollments: NewTeacherDashboardComponent.sum(current, 'enrollments'),
    };
  });

  // ---- Chart (ApexCharts) -----------------------------------------------------------------------
  private readonly seriesLabels = toSignal(
    this.translate.stream([`${T}.CURRENT_PERIOD`, `${T}.PREVIOUS_PERIOD`]),
  );

  protected readonly series = computed<ApexAxisChartSeries>(() => {
    const { current, previous } = this.periods();
    const labels = this.seriesLabels();
    return [
      {
        name: labels?.[`${T}.CURRENT_PERIOD`] ?? '',
        type: 'area',
        data: current.map((d) => d.earning),
      },
      {
        name: labels?.[`${T}.PREVIOUS_PERIOD`] ?? '',
        type: 'line',
        data: previous.map((d) => d.earning),
      },
    ];
  });

  protected readonly xaxis = computed<ApexXAxis>(() => ({
    // Labels are hidden (clean look); categories feed the tooltip header.
    categories: this.periods().current.map((d) => this.pointDateFmt.format(this.parseDate(d.date))),
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false },
  }));

  // Gold dot on the latest point.
  protected readonly markers = computed<ApexMarkers>(() => {
    const last = this.periods().current.length - 1;
    return {
      size: 0,
      hover: { size: 5 },
      discrete:
        last >= 0
          ? [
              {
                seriesIndex: 0,
                dataPointIndex: last,
                size: 6,
                fillColor: 'var(--color-star)',
                strokeColor: 'var(--color-surface)',
              },
            ]
          : [],
    };
  });

  protected readonly chart: ApexChart = {
    type: 'line',
    height: 260,
    fontFamily: 'var(--font)',
    toolbar: { show: false },
    zoom: { enabled: false },
    background: 'transparent',
    parentHeightOffset: 0,
  };

  protected readonly colors = ['var(--color-primary-light)', 'var(--color-muted)'];

  protected readonly stroke: ApexStroke = {
    show: true,
    width: [3, 2],
    curve: 'straight',
    dashArray: [0, 5],
    lineCap: 'round',
  };

  // Flat translucent area: gradients need real color values, which CSS variables can't give Apex.
  protected readonly fill: ApexFill = { type: 'solid', opacity: [0.14, 1] };

  protected readonly legend: ApexLegend = { show: false };
  protected readonly dataLabels: ApexDataLabels = { enabled: false };

  protected readonly grid: ApexGrid = {
    borderColor: 'var(--color-border)',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    padding: { top: 10, right: 8, bottom: 0, left: 8 },
  };

  protected readonly yaxis: ApexYAxis = { show: false, min: 0, tickAmount: 2 };

  protected readonly tooltip: ApexTooltip = {
    theme: 'dark',
    shared: true,
    intersect: false,
    style: { fontSize: '13px', fontFamily: 'var(--font)' },
    y: { formatter: (value: number) => this.formatMoney(value) },
  };

  protected readonly states: ApexStates = {
    hover: { filter: { type: 'lighten' } },
    active: { filter: { type: 'darken' } },
  };

  private formatMoney(value: number): string {
    return `${this.numberFmt.format(value)} ${this.translate.instant('COMMON.CURRENCY_EGP')}`;
  }

  // ---- Tasks: whichever of the five has something waiting, most urgent first --------------------
  protected readonly tasks = computed<Task[]>(() => {
    const a = this.teacherStore.attention();
    const all: Task[] = [
      {
        id: 'assignmentsToGrade',
        count: a?.assignmentsToGrade ?? 0,
        label: `${T}.TASK_ASSIGNMENTS_TO_GRADE`,
        cta: `${T}.TASK_GRADE_CTA`,
        route: this.routes.assignments,
      },
      {
        id: 'quizzesToGrade',
        count: a?.quizzesToGrade ?? 0,
        label: `${T}.TASK_QUIZZES_TO_GRADE`,
        cta: `${T}.TASK_GRADE_CTA`,
        route: this.routes.quizzes,
      },
      {
        id: 'unreadMessages',
        count: a?.unreadMessages ?? 0,
        label: `${T}.TASK_UNREAD_MESSAGES`,
        cta: `${T}.TASK_MESSAGES_CTA`,
        route: this.routes.messages,
      },
      {
        id: 'lessonsWithoutEnrollments',
        count: a?.lessonsWithoutEnrollments ?? 0,
        label: `${T}.TASK_NO_ENROLLMENTS`,
        cta: `${T}.TASK_LESSONS_CTA`,
        route: this.routes.lessons,
      },
      {
        id: 'draftLessons',
        count: a?.draftLessons ?? 0,
        label: `${T}.TASK_DRAFTS`,
        cta: `${T}.TASK_PUBLISH_CTA`,
        route: this.routes.lessons,
      },
    ];
    return all.filter((task) => task.count > 0);
  });

  protected readonly featuredTask = computed(() => this.tasks()[0] ?? null);
  protected readonly otherTasks = computed(() => this.tasks().slice(1));

  // ---- Activity feed (the audit log is the teacher's own actions) -------------------------------
  private readonly langTick = toSignal(
    this.translate.onLangChange.pipe(map(() => Date.now())),
    { initialValue: 0 },
  );

  protected readonly activity = computed(() => {
    this.langTick(); // re-run when the language changes
    return this.teacherStore.logs().map((log) => ({
      id: log.id,
      createdAt: log.createdAt,
      text: `${this.actionLabel(log.action)} ${this.entityLabel(log.tableName)}`,
    }));
  });

  public ngOnInit(): void {
    this.teacherStore.loadDashboardStatus();
    this.teacherStore.loadDashboardGraph();
  }

  // ---- Template helpers -------------------------------------------------------------------------
  protected deltaView(delta: number): { arrow: string; value: number; chip: string } {
    if (delta > 0) return { arrow: '▲', value: delta, chip: 'bg-mint/10 text-mint' };
    if (delta < 0) return { arrow: '▼', value: -delta, chip: 'bg-coral/10 text-coral' };
    return { arrow: '', value: 0, chip: 'bg-surface-subtle text-muted' };
  }

  protected timeAgo(iso: string | null): string {
    if (!iso) return '';
    const date = new Date(iso);
    const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
    const abs = Math.abs(diffSec);

    if (abs >= 7 * 86400) return this.shortDateFmt.format(date);

    const units: [Intl.RelativeTimeFormatUnit, number][] = [
      ['day', 86400],
      ['hour', 3600],
      ['minute', 60],
    ];
    for (const [unit, secs] of units) {
      if (abs >= secs) return this.relativeFmt.format(Math.round(diffSec / secs), unit);
    }
    return this.relativeFmt.format(0, 'second'); // "now"
  }

  // ---- Internals --------------------------------------------------------------------------------
  private actionLabel(action: string): string {
    const kind =
      action === Action.CREATE
        ? 'CREATED'
        : action === Action.UPDATE
          ? 'UPDATED'
          : action === Action.DELETE
            ? 'DELETED'
            : null;
    return kind ? this.translate.instant(`${T}.ACTIONS.${kind}`) : action;
  }

  private entityLabel(table: string): string {
    const key = `${T}.ENTITIES.${table.toUpperCase()}`;
    const label = this.translate.instant(key);
    return label === key ? table : label; // fall back to the raw table name
  }

  private parseDate(iso: string): Date {
    return new Date(`${iso}T00:00:00`);
  }

  private static sum(entries: readonly EarningEntry[], field: 'earning' | 'enrollments'): number {
    return entries.reduce((acc, e) => acc + e[field], 0);
  }

  private static percentChange(current: number, previous: number): number | null {
    return previous === 0 ? null : ((current - previous) / previous) * 100;
  }
}