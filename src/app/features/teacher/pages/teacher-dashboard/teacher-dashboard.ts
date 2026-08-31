import { Component, OnInit, inject, WritableSignal, signal, computed, effect } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
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
import { TranslatePipe } from '@ngx-translate/core';
import { TeacherStore } from './stores/teacher-store';
import { AuthStore } from '../../../../core/stores/auth.store';

export interface ChartOptions {
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
  labels?: unknown;
}
@Component({
  selector: 'app-teacher-dashboard',
  imports: [FormsModule, ReactiveFormsModule, ChartComponent, DatePipe, DecimalPipe, TranslatePipe],
  templateUrl: './teacher-dashboard.html',
  styles: `
    .styled-scroll {
      scrollbar-width: thin;
      scrollbar-color: var(--color-primary) transparent;
    }

    .styled-scroll::-webkit-scrollbar {
      width: 4px;
    }

    .styled-scroll::-webkit-scrollbar-track {
      background: transparent;
    }

    .styled-scroll::-webkit-scrollbar-thumb {
      background: var(--color-primary);
      border-radius: 999px;
    }

    .styled-scroll::-webkit-scrollbar-thumb:hover {
      background: var(--color-primary-light);
    }
  `,
})
export class TeacherDashboardComponent implements OnInit {
  protected readonly teacherStore = inject(TeacherStore);
  protected readonly authStore = inject(AuthStore);
  protected firstName = computed(() => this.authStore.user()?.firstName);
  protected secondName = computed(() => this.authStore.user()?.secondName);
  public series: WritableSignal<ApexNonAxisChartSeries> = signal([
    { data: [], color: 'var(--color-primary)' },
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
          color: 'var(--color-primary)',
        },
      ]);
    });
  }
  ngOnInit(): void {
    this.teacherStore.loadDashboardStatus();
    const newSeries: ApexNonAxisChartSeries = [
      { data: [1, 123, 234, 234, 234, 23, 234], color: 'var(--color-primary)' },
    ];

    this.series.set(newSeries);
  }
  public chartOptions: Partial<ChartOptions> = {
    colors: ['var(--color-primary)'],

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
      borderColor: 'var(--color-border)', // Matches design system system border lines
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
        color: 'var(--color-border)',
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: 'var(--color-muted)', // Uses design-system secondary font colors
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
          colors: 'var(--color-muted)',
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
      //       background: var(--color-surface-subtle);
      //       color: var(--color-ink);
      //       border-radius: 12px;
      //       padding: 10px 14px;
      //       direction: rtl;
      //       font-family: var(--font);
      //     ">
      //       <span style="font-size: 11px; color: var(--color-muted); display: block; margin-bottom: 4px;">
      //         ${w.globals.labels[dataPointIndex]}
      //       </span>
      //       <div style="display: flex; align-items: center; gap: 8px;">
      //         <span style="width: 8px; height: 8px; background: var(--color-primary); border-radius: 50%;"></span>
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
