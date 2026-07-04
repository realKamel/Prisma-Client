import {
  Component,
  viewChild,
  ElementRef,
  AfterViewInit,
  OnInit,
  inject,
  WritableSignal,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgApexchartsModule,
  ChartComponent,
  ApexAnnotations,
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexStates,
  ApexStroke,
  ApexTheme,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
} from 'ng-apexcharts';
import { TeacherStore } from './stores/teacher-store';
import { ArDatePipe } from '../../../core/pipes/ar-date.pipe';
import { AuthStore } from '../../../core/stores/user-store/user-store';

export type ChartOptions = {
  series?: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart?: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  title?: ApexTitleSubtitle;
  subtitle?: ApexTitleSubtitle;
  dataLabels?: ApexDataLabels;
  stroke?: ApexStroke;
  fill?: ApexFill;
  legend?: ApexLegend;
  tooltip?: ApexTooltip;
  markers?: ApexMarkers;
  plotOptions?: ApexPlotOptions;
  responsive?: ApexResponsive[];
  grid?: ApexGrid;
  annotations?: ApexAnnotations;
  states?: ApexStates;
  theme?: ApexTheme;
  colors?: string[];
  labels?: any;
};
@Component({
  selector: 'app-teacher-dashboard',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ChartComponent, DatePipe],
  templateUrl: './teacher-dashboard.html',
  providers: [NgApexchartsModule],
  styles: `
    .styled-scroll {
      scrollbar-width: thin;
      scrollbar-color: var(--purple) transparent;
    }

    .styled-scroll::-webkit-scrollbar {
      width: 4px;
    }

    .styled-scroll::-webkit-scrollbar-track {
      background: transparent;
    }

    .styled-scroll::-webkit-scrollbar-thumb {
      background: var(--purple);
      border-radius: 999px;
    }

    .styled-scroll::-webkit-scrollbar-thumb:hover {
      background: var(--purple-lt);
    }
  `,
})
export class TeacherDashboardComponent implements OnInit {
  protected readonly teacherStore = inject(TeacherStore);
  protected readonly authStore = inject(AuthStore);
  protected firstName = computed(() => this.authStore.user()?.firstName);
  protected secondName = computed(() => this.authStore.user()?.secondName);
  public series: WritableSignal<ApexNonAxisChartSeries> = signal([
    { data: [], color: 'var(--purple)' },
  ]);

  public totalWeekEarning = computed(
    () => this.teacherStore.weekEarnings()?.totalEarningsForThisWeek,
  );

  constructor() {
    effect(() => {
      const apiData = this.teacherStore.weekEarnings();
      if (!apiData) return;

      this.series.set([
        {
          data: apiData.data.map((x) => x.earning),
          color: 'var(--purple)',
        },
      ]);
    });
  }
  ngOnInit(): void {
    this.teacherStore.loadDashboardStatus();
    var newSeries: ApexNonAxisChartSeries = [
      { data: [0, 0, 0, 0, 0, 0, 0], color: 'var(--purple)' },
    ];

    this.series.set(newSeries);
  }
  public chartOptions: Partial<ChartOptions> = {
    colors: ['var(--purple)'],

    chart: {
      type: 'bar',
      fontFamily: 'var(--font)', // Cairo, sans-serif
      toolbar: {
        show: false, // Cleaner, modern layout dashboard aesthetic
      },
      background: 'transparent', // Inherits surface background organically
    },

    plotOptions: {
      bar: {
        borderRadius: 6,
        borderRadiusApplication: 'around',
        horizontal: false,
        columnWidth: '55%',
      },
    },

    dataLabels: {
      enabled: false, // Better UX for modern bar charts (Clean look, reliant on tooltips)
    },

    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },

    grid: {
      borderColor: 'var(--border)', // Matches design system system border lines
      strokeDashArray: 4, // Clean dashed layout lines
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true, // Gridlines on Y-axis for scale visibility
        },
      },
      padding: {
        top: 10,
        right: 10,
        bottom: 0,
        left: 10,
      },
    },

    xaxis: {
      categories: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الاربعاء', 'الخميس', 'الجمعة'],
      axisBorder: {
        show: true,
        color: 'var(--border)',
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: 'var(--muted)', // Uses design-system secondary font colors
          fontSize: '12px',
        },
      },
    },

    yaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: 'var(--muted)',
          fontSize: '12px',
        },
      },
    },

    tooltip: {
      theme: 'dark', // Native override fallback or handled styled via CSS variables
      style: {
        fontSize: '13px',
        fontFamily: 'var(--font)',
      },
      // custom: function ({ series, seriesIndex, dataPointIndex, w }) {
      //   // Fully styled custom tooltips adapting beautifully to RTL and tokens
      //   return `
      //     <div style="
      //       background: var(--surface2);
      //       color: var(--ink);
      //       border-radius: 12px;
      //       padding: 10px 14px;
      //       direction: rtl;
      //       font-family: var(--font);
      //     ">
      //       <span style="font-size: 11px; color: var(--muted); display: block; margin-bottom: 4px;">
      //         ${w.globals.labels[dataPointIndex]}
      //       </span>
      //       <div style="display: flex; align-items: center; gap: 8px;">
      //         <span style="width: 8px; height: 8px; background: var(--purple); border-radius: 50%;"></span>
      //         <strong>${series[seriesIndex][dataPointIndex]}</strong>
      //       </div>
      //     </div>
      //   `;
      // },
    },

    states: {
      hover: {
        filter: {
          type: 'lighten',
        },
      },
      active: {
        filter: {
          type: 'darken',
        },
      },
    },
  };
}
