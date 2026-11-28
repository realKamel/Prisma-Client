import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import {
  bootstrapCheckCircleFill,
  bootstrapChevronDown,
  bootstrapClockFill,
  bootstrapJournalBookmarkFill,
  bootstrapTrophyFill,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexResponsive,
  ApexStates,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ChartComponent,
} from 'ng-apexcharts';
import { CountUpDirective } from '../../../../../../shared/directives/count-up/count-up.directive';
import { StatKey, StatPoint, StatsDto, StatsHistoryDto } from '../../../../models/dashboard.models';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map, merge } from 'rxjs';

type Range = 7 | 30;

/** Minimal typing so this compiles even if the project's TS `lib.dom` lacks View Transitions. */
interface ViewTransitionApi {
  startViewTransition?: (update: () => void) => {
    ready: Promise<unknown>;
    finished: Promise<unknown>;
  };
}

const K = 'DASHBOARD.STATS';

interface TileConfig {
  key: StatKey;
  label: string;   // translation keys
  short: string;
  totalLabel: string;
  unit: string | null;
  icon: string;
  color: string;
  mode: 'number' | 'percent';
  agg: 'sum' | 'max';
  perAttempt: boolean;
  format: 'lessons' | 'duration' | 'percent';
}

interface StatView {
  tile: TileConfig;
  current: (number | null)[];
  previous: (number | null)[] | null;
  categories: string[];
  /** Index of the highest point (per-attempt tiles only). */
  maxIndex: number | null;
  total: number;
  /** Extra readable total, e.g. "ساعتين و٥ دقيقة". */
  extra: string;
  delta: number | null;
  deltaKey: string;
  hasData: boolean;
  hasPrevious: boolean;
  /** Legend texts: date range + headline value for each period. */
  range: string;
  prevRange: string;
  currentValue: string;
  previousValue: string;
  valuePrefix: string;
  from: string;
  to: string;
}

const NUM = new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 1 });
const DAY = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short' });

/** Set once this device proved it can't keep up with the morphing transition. */
const LITE_KEY = 'stats-strip-lite';

const TILES: readonly TileConfig[] = [
  {
    key: 'purchasedLessons',
    label: `${K}.TILES.PURCHASED_LESSONS.LABEL`,
    short: `${K}.TILES.PURCHASED_LESSONS.SHORT`,
    totalLabel: `${K}.TILES.PURCHASED_LESSONS.TOTAL`,
    unit: `${K}.UNITS.LESSON`,
    icon: 'bootstrapJournalBookmarkFill',
    color: 'var(--color-primary-light)',
    mode: 'number',
    agg: 'sum',
    perAttempt: false,
    format: 'lessons',
  },
  {
    key: 'completedLessons',
    label: `${K}.TILES.COMPLETED_LESSONS.LABEL`,
    short: `${K}.TILES.COMPLETED_LESSONS.SHORT`,
    totalLabel: `${K}.TILES.COMPLETED_LESSONS.TOTAL`,
    unit: `${K}.UNITS.LESSON`,
    icon: 'bootstrapCheckCircleFill',
    color: 'var(--color-mint)',
    mode: 'number',
    agg: 'sum',
    perAttempt: false,
    format: 'lessons',
  },
  {
    key: 'studyHours',
    label: `${K}.TILES.STUDY_HOURS.LABEL`,
    short: `${K}.TILES.STUDY_HOURS.SHORT`,
    totalLabel: `${K}.TILES.STUDY_HOURS.TOTAL`,
    unit: `${K}.UNITS.MINUTE`,
    icon: 'bootstrapClockFill',
    color: 'var(--color-star)',
    mode: 'number',
    agg: 'sum',
    perAttempt: false,
    format: 'duration', // series is in MINUTES
  },
  {
    key: 'topQuizScore',
    label: `${K}.TILES.TOP_QUIZ_SCORE.LABEL`,
    short: `${K}.TILES.TOP_QUIZ_SCORE.SHORT`,
    totalLabel: `${K}.TILES.TOP_QUIZ_SCORE.TOTAL`,
    unit: null,
    icon: 'bootstrapTrophyFill',
    color: 'var(--color-coral)',
    mode: 'percent',
    agg: 'max',
    perAttempt: true,
    format: 'percent',
  },
];
const sum = (a: number[]): number => a.reduce((s, v) => s + v, 0);
const max = (a: number[]): number => (a.length ? Math.max(...a) : 0);

/**
 * Global on purpose (ViewEncapsulation.None): ::view-transition-* pseudo-elements live on the
 * document, so emulated-encapsulation selectors can never reach them.
 */
const STYLES = `
  /* Tiles + panel morph between layouts with one shared easing */
  ::view-transition-group(stat-tile-0),
  ::view-transition-group(stat-tile-1),
  ::view-transition-group(stat-tile-2),
  ::view-transition-group(stat-tile-3),
  ::view-transition-group(stat-panel) {
    animation-duration: 320ms;
    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  }
  /* Stagger: tiles fly to their new spot one after another (old/new inherit the delay) */
  ::view-transition-group(stat-tile-1) { animation-delay: 20ms; }
  ::view-transition-group(stat-tile-2) { animation-delay: 40ms; }
  ::view-transition-group(stat-tile-3) { animation-delay: 60ms; }

  /* Panel opening / closing (exists in only one of the two states) */
  ::view-transition-new(stat-panel):only-child {
    animation: stat-panel-in 340ms cubic-bezier(0.22, 1, 0.36, 1) 60ms both;
  }
  ::view-transition-old(stat-panel):only-child {
    animation: stat-panel-out 160ms ease-in both;
  }

  /* Panel content swapping between two tiles */
  ::view-transition-old(stat-panel):not(:only-child) {
    animation: stat-swap-out 120ms ease-in both;
    mix-blend-mode: normal;
  }
  ::view-transition-new(stat-panel):not(:only-child) {
    animation: stat-swap-in 240ms cubic-bezier(0.22, 1, 0.36, 1) 60ms both;
    mix-blend-mode: normal;
  }

  @keyframes stat-panel-in {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
  }
  @keyframes stat-panel-out {
    to { opacity: 0; transform: translateY(16px) scale(0.97); }
  }
  @keyframes stat-swap-out {
    to { opacity: 0; transform: translateY(-10px); }
  }
  @keyframes stat-swap-in {
    from { opacity: 0; transform: translateY(14px); }
  }

  /* While a transition runs, CSS transitions on the live elements would fight the snapshots */
  :root[data-stat-vt] :is(.stat-tile, #stats-panel),
  :root[data-stat-vt] :is(.stat-tile, #stats-panel) * {
    transition: none !important;
  }

  /* Only tiles + panel animate. Cross-fading a snapshot of the whole page is what makes it janky */
  :root[data-stat-vt]::view-transition-old(root) { display: none; }
  :root[data-stat-vt]::view-transition-new(root) { animation: none; }

  /* Tiles change aspect ratio between layouts: fill the group instead of keeping the old ratio */
  ::view-transition-old(stat-tile-0), ::view-transition-new(stat-tile-0),
  ::view-transition-old(stat-tile-1), ::view-transition-new(stat-tile-1),
  ::view-transition-old(stat-tile-2), ::view-transition-new(stat-tile-2),
  ::view-transition-old(stat-tile-3), ::view-transition-new(stat-tile-3) {
    width: 100%;
    height: 100%;
  }

  /* Accent bar sweep + fallback entrance when View Transitions aren't available */
  .stat-bar { animation: stat-bar-sweep 420ms cubic-bezier(0.22, 1, 0.36, 1) 80ms both; }
  @keyframes stat-bar-sweep { from { transform: scaleX(0); } }
  .stat-panel-enter { animation: stat-panel-in 300ms cubic-bezier(0.22, 1, 0.36, 1) both; }
 
  @media (prefers-reduced-motion: reduce) {
    .stat-bar, .stat-panel-enter { animation: none; }
  }
`;

@Component({
  selector: 'app-stats-strip',
  imports: [CountUpDirective, NgIcon, ChartComponent, TranslatePipe],
  templateUrl: './stats-strip.html',
  encapsulation: ViewEncapsulation.None,
  styles: [STYLES],
  viewProviders: [
    provideIcons({
      bootstrapJournalBookmarkFill,
      bootstrapCheckCircleFill,
      bootstrapClockFill,
      bootstrapTrophyFill,
      bootstrapChevronDown,
    }),
  ],
})
export class StatsStripComponent {
  public readonly stats = input.required<StatsDto>();
  public readonly history = input<StatsHistoryDto | null>(null);
  public readonly historyLoading = input(false);
  /** Fired when a tile opens and there is no history yet (also used by the retry button). */
  public readonly historyRequested = output<void>();

  private readonly translate = inject(TranslateService);

  protected readonly tiles = TILES;
  protected readonly ranges: readonly Range[] = [7, 30];
  protected readonly range = signal<Range>(30);
  protected readonly fmt = (n: number): string => NUM.format(n);

  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Which tile is open right now (null = tiles in a row, no panel). */
  protected readonly activeKey = signal<StatKey | null>(null);
  protected readonly isOpen = computed(() => this.activeKey() !== null);
  /** Bumped on every open/switch so the chart is re-created and replays its entrance animation. */
  protected readonly chartKey = signal(0);
  /**
   * The chart (Apex's JS animation + SVG work) is mounted only AFTER the transition finishes, so the
   * transition itself only moves cheap, already-rendered pieces.
   */
  protected readonly chartReady = signal(true);
  private transitioning = false;
  protected readonly totalKey = computed(() => `${this.range()}-${this.chartKey()}`);

  private readonly reduceMotion =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  private readonly viewTransitions = this.document as unknown as ViewTransitionApi;
  private readonly supportsViewTransitions =
    typeof this.viewTransitions.startViewTransition === 'function';

  /**
   * Lite mode (weak devices): no morphing transition. Tiles snap into place, the panel enters with a
   * cheap transform/opacity animation and the chart draws afterwards, with lighter animations.
   * Turned on up-front for very low-end devices, otherwise after two measurably janky transitions.
   */
  protected readonly lite = signal(this.detectLite());
  private slowRuns = 0;

  /** CSS-only entrance used whenever the morphing transition isn't (or can't be) used. */
  protected readonly fallbackEnter = computed(
    () => !this.reduceMotion && (!this.supportsViewTransitions || this.lite()),
  );
  private readonly i18nTick = toSignal(
    merge(this.translate.onLangChange, this.translate.onTranslationChange).pipe(map(() => ({}))),
    { initialValue: {} },
  );
  private t(key: string, params?: Record<string, string>): string {
    return this.translate.instant(key, params);
  }
  private duration(minutes: number): string {
    const m = Math.round(minutes);
    if (m < 60) return this.t(`${K}.FORMAT.MINUTES`, { n: NUM.format(m) });
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r
      ? this.t(`${K}.FORMAT.HOURS_MINUTES`, { h: NUM.format(h), m: NUM.format(r) })
      : this.t(`${K}.FORMAT.HOURS`, { n: NUM.format(h) });
  }
  private formatValue(tile: TileConfig, n: number): string {
    switch (tile.format) {
      case 'lessons':
        return this.t(`${K}.FORMAT.LESSONS`, { n: NUM.format(n) });
      case 'duration':
        return this.duration(n);
      case 'percent':
        return this.t(`${K}.FORMAT.PERCENT`, { n: NUM.format(n) });
    }
  }
  private withPrefix(tile: TileConfig, value: string): string {
    return tile.perAttempt ? this.t(`${K}.HIGHEST_VALUE`, { value }) : value;
  }
  protected toggle(key: StatKey): void {
    if (this.transitioning) return;
    const next = this.activeKey() === key ? null : key;

    this.withTransition(() => {
      this.activeKey.set(next);
      if (next) this.chartKey.update((n) => n + 1);
    });

    if (next && !this.history() && !this.historyLoading()) {
      this.historyRequested.emit();
    }
  }

  /**
   * Runs a state change inside a View Transition: the browser snapshots the tiles and the panel
   * before/after and morphs each named element (see view-transition-name in the template).
   * appRef.tick() makes Angular render synchronously so the "after" snapshot is the final layout.
   */
  private withTransition(update: () => void): void {
    if (this.reduceMotion) {
      update();
      return;
    }

    if (!this.supportsViewTransitions || this.lite()) {
      // Cheap path: nothing but the panel's transform/opacity entrance, chart draws once it's done.
      this.transitioning = true;
      this.chartReady.set(false);
      update();
      setTimeout(() => {
        this.transitioning = false;
        this.chartReady.set(true);
        this.revealPanel();
      }, 320);
      return;
    }

    const root = this.document.documentElement;
    this.transitioning = true;
    root.setAttribute('data-stat-vt', '');

    const done = (): void => {
      root.removeAttribute('data-stat-vt');
      this.transitioning = false;
      this.chartReady.set(true); // now the chart can draw itself with its own entrance animation
      this.revealPanel();
    };

    const transition = this.viewTransitions.startViewTransition!(() => {
      this.chartReady.set(false);
      update();
      this.appRef.tick();
    });

    transition.finished.then(done, done);
    this.watchSmoothness(transition);
  }

  /** Measures frame times while the transition plays; two slow runs in a row => lite mode for good. */
  private watchSmoothness(transition: { ready: Promise<unknown>; finished: Promise<unknown> }): void {
    let running = false;
    let last = 0;
    let frames = 0;
    let total = 0;

    const step = (t: number): void => {
      if (!running) return;
      if (last) {
        frames++;
        total += t - last;
      }
      last = t;
      requestAnimationFrame(step);
    };

    transition.ready.then(
      () => {
        running = true;
        requestAnimationFrame(step);
      },
      () => undefined,
    );

    transition.finished.then(
      () => {
        running = false;
        const slow = frames >= 5 && total / frames > 26; // under ~38 fps on average
        this.slowRuns = slow ? this.slowRuns + 1 : 0;
        if (this.slowRuns >= 2) this.enableLite();
      },
      () => undefined,
    );
  }

  private enableLite(): void {
    this.lite.set(true);
    try {
      localStorage.setItem(LITE_KEY, '1');
    } catch {
      /* storage blocked: lite just lasts for this session */
    }
  }

  private detectLite(): boolean {
    try {
      if (localStorage.getItem(LITE_KEY) === '1') return true;
    } catch {
      /* storage blocked */
    }
    if (typeof navigator === 'undefined') return false;
    const nav = navigator as Navigator & { deviceMemory?: number };
    return (nav.deviceMemory ?? 8) <= 2 || (nav.hardwareConcurrency ?? 8) <= 2;
  }

  /** On phones the panel sits below the tiles: make sure it's actually on screen. */
  private revealPanel(): void {
    if (!this.activeKey()) return;
    this.host.nativeElement
      .querySelector<HTMLElement>('#stats-panel')
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  protected retry(): void {
    this.historyRequested.emit();
  }

  protected deltaView(delta: number): { arrow: string; value: number; chip: string } {
    const up = delta >= 0;
    return {
      arrow: up ? '▲' : '▼',
      value: Math.abs(delta),
      chip: up ? 'bg-mint/15 text-mint' : 'bg-coral/15 text-coral',
    };
  }

  // ---- Data -----------------------------------------------------------------------------------
  protected readonly activeTile = computed(
    () => TILES.find((t) => t.key === this.activeKey()) ?? null,
  );

  protected readonly view = computed<StatView | null>(() => {
    this.i18nTick();
    const tile = this.activeTile();
    const history = this.history();
    if (!tile || !history) return null;

    const all = history[tile.key] ?? [];
    const n = this.range();

    let current: StatPoint[];
    let previous: StatPoint[];
    let range = '';
    let prevRange = '';
    const span = (a?: string, b?: string): string =>
      a && b ? `${this.formatDate(a)} – ${this.formatDate(b)}` : '';

    if (tile.perAttempt) {
      // Attempts are real events, not daily buckets: split them by date window.
      const anchor =
        history.purchasedLessons.at(-1)?.date ?? new Date().toISOString().slice(0, 10);
      const from = this.addDays(anchor, -(n - 1));
      const prevFrom = this.addDays(anchor, -(2 * n - 1));
      current = all.filter((p) => p.date >= from);
      previous = all.filter((p) => p.date >= prevFrom && p.date < from);
      range = span(from, anchor);
      prevRange = span(prevFrom, this.addDays(from, -1));
    } else {
      current = all.slice(-n);
      previous = all.slice(-2 * n, -n);
      range = span(current[0]?.date, current.at(-1)?.date);
      prevRange = span(previous[0]?.date, previous.at(-1)?.date);
    }

    // Every tile compares against the previous period whenever that period exists.
    const hasPrevious = previous.length > 0;

    const values = current.map((p) => p.value);
    const prevValues = previous.map((p) => p.value);
    const rawTotal = tile.agg === 'sum' ? sum(values) : max(values);
    const rawPrev = tile.agg === 'sum' ? sum(prevValues) : max(prevValues);
    const total = Math.round(rawTotal);

    let delta: number | null = null;
    if (hasPrevious) {
      delta =
        tile.agg === 'sum'
          ? rawPrev > 0
            ? Math.round(((rawTotal - rawPrev) / rawPrev) * 100)
            : null
          : Math.round(rawTotal - rawPrev);
    }

    // Per-attempt charts can have different lengths in the two periods: pad with nulls.
    const length = tile.perAttempt ? Math.max(current.length, previous.length) : current.length;
    const pad = (vals: number[]): (number | null)[] =>
      Array.from({ length }, (_, i) => vals[i] ?? null);

    const categories = Array.from({ length }, (_, i) =>
      this.formatDate((current[i] ?? previous[i]).date),
    );

    return {
      tile,
      current: pad(values),
      previous: hasPrevious ? pad(prevValues) : null,
      categories,
      maxIndex: tile.perAttempt && values.length ? values.indexOf(max(values)) : null,
      total,
      extra: tile.key === 'studyHours' && total >= 60 ? this.duration(total) : '',
      delta,
      deltaKey: tile.agg === 'sum' ? `${K}.DELTA_PERCENT` : `${K}.DELTA_POINTS`,
      hasData: tile.perAttempt
        ? current.length > 0 || previous.length > 0
        : rawTotal > 0 || rawPrev > 0,
      hasPrevious,
      range,
      prevRange,
      currentValue: this.withPrefix(tile, this.formatValue(tile, rawTotal)),
      previousValue: hasPrevious ? this.withPrefix(tile, this.formatValue(tile, rawPrev)) : '',
      valuePrefix: tile.perAttempt ? 'الأعلى ' : '',
      from: current.length ? this.formatDate(current[0].date) : '',
      to: current.length ? this.formatDate(current[current.length - 1].date) : '',
    };
  });

  protected readonly series = computed<ApexAxisChartSeries>(() => {
    const v = this.view();
    if (!v) return [];
    const series: ApexAxisChartSeries = [
      { name: this.t(`${K}.CURRENT_PERIOD`), type: 'line', data: v.current },
    ];
    if (v.previous) {
      series.push({ name: this.t(`${K}.PREVIOUS_PERIOD`), type: 'line', data: v.previous });
    }
    return series;
  });

  // ---- Chart (ApexCharts) ---------------------------------------------------------------------
  protected readonly chart = computed<ApexChart>(() => ({
    type: 'line', // mixed chart: each series declares its own type
    height: 280,
    fontFamily: 'var(--font)',
    toolbar: { show: false },
    zoom: { enabled: false },
    background: 'transparent',
    parentHeightOffset: 0,
    animations: {
      enabled: !this.reduceMotion,
      speed: this.lite() ? 350 : 600,
      easing: 'easeinout',
      // Per-point staggering is what hurts old GPUs/CPUs most.
      animateGradually: { enabled: !this.lite(), delay: 40 },
      // Smooth morph when switching 7 ↔ 30 days.
      dynamicAnimation: { enabled: true, speed: this.lite() ? 250 : 400 },
    },
  }));

  protected readonly responsive: ApexResponsive[] = [
    {
      breakpoint: 640,
      options: { chart: { height: 210 } },
    },
  ];

  protected readonly colors = computed(() => [
    this.activeTile()?.color ?? 'var(--color-primary-light)',
    'var(--color-muted)',
  ]);

  protected readonly stroke = computed<ApexStroke>(() => ({
    show: true,
    width: [3, 2],
    curve: 'smooth',
    dashArray: [0, 5],
    lineCap: 'round',
  }));

  protected readonly fill: ApexFill = { type: 'solid', opacity: 1 };

  protected readonly xaxis = computed<ApexXAxis>(() => ({
    categories: this.view()?.categories ?? [],
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false },
  }));

  protected readonly yaxis = computed<ApexYAxis>(() => ({
    show: false,
    min: 0,
    tickAmount: 2,
    ...(this.activeTile()?.mode === 'percent' ? { max: 100 } : {}),
  }));

  protected readonly markers = computed<ApexMarkers>(() => {
    const v = this.view();
    if (!v) return { size: 0 };

    const gold = { fillColor: 'var(--color-star)', strokeColor: 'var(--color-surface)' };

    // Clean lines everywhere, one gold dot on the current period:
    // quiz -> the highest attempt, every other tile -> the latest point.
    const target = v.tile.perAttempt ? v.maxIndex : v.current.length - 1;
    return {
      size: 0,
      hover: { size: 5 },
      discrete:
        target !== null && target >= 0
          ? [
            {
              seriesIndex: 0,
              dataPointIndex: target,
              size: v.tile.perAttempt ? 8 : 6,
              ...gold,
            },
          ]
          : [],
    };
  });

  // Quiz: a label above the highest attempt only.
  protected readonly dataLabels = computed<ApexDataLabels>(() => {
    this.i18nTick();
    const v = this.view();
    if (!v || v.maxIndex === null) return { enabled: false };

    const idx = v.maxIndex;
    const tile = v.tile;
    return {
      enabled: true,
      enabledOnSeries: [0],
      offsetY: -10,
      formatter: (val, opts) =>
        opts?.dataPointIndex === idx && typeof val === 'number' ? this.formatValue(tile, val) : '',
      style: {
        fontSize: '12px',
        fontFamily: 'var(--font)',
        fontWeight: 800,
        colors: ['var(--color-star)'],
      },
      background: { enabled: false },
    };
  });

  protected readonly legend: ApexLegend = { show: false };

  protected readonly grid = computed<ApexGrid>(() => ({
    borderColor: 'var(--color-border)',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    // Extra headroom so the "highest" label never touches the top edge.
    padding: { top: this.activeTile()?.perAttempt ? 28 : 10, right: 8, bottom: 0, left: 8 },
  }));

  protected readonly tooltip = computed<ApexTooltip>(() => {
    this.i18nTick();
    const tile = this.activeTile();
    return {
      theme: 'dark',
      shared: true,
      intersect: false,
      style: { fontSize: '13px', fontFamily: 'var(--font)' },
      y: {
        formatter: (value: number) =>
          value == null ? '' : tile ? this.formatValue(tile, value) : String(value),
      },
    };
  });
  
  protected readonly states: ApexStates = {
    hover: { filter: { type: 'lighten' } },
    active: { filter: { type: 'darken' } },
  };

  private formatDate(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    return DAY.format(new Date(y, m - 1, d));
  }

  private addDays(iso: string, days: number): string {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
  }
}