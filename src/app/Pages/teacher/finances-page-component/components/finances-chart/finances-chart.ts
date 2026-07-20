// components/finances-chart/finances-chart.component.ts
import { Component, Input, computed, signal } from '@angular/core';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexGrid,
  ApexFill,
  ApexStroke,
  ApexTooltip,
  ApexPlotOptions,
  ApexStates,
} from 'ng-apexcharts';
import { MonthlyRevenuePoint } from '../../../../../core/Models/Teacher/finance-summary.model';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  fill: ApexFill;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  plotOptions: ApexPlotOptions;
  states: ApexStates;
  colors: string[];
};

@Component({
  selector: 'app-finances-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './finances-chart.html',
})
export class FinancesChart {
  private readonly _data = signal<MonthlyRevenuePoint[]>([]);

  @Input({ required: true }) set data(value: MonthlyRevenuePoint[]) {
    this._data.set(value ?? []);
  }

  @Input() loading = false;

  readonly chartOptions = computed<ChartOptions>(() => {
    const points = this._data();

    return {
      series: [{ name: 'الإيرادات', data: points.map((p) => p.amount) }],

      colors: ['var(--purple)'],

      chart: {
        type: 'bar',
        height: 260,
        fontFamily: 'var(--font)',
        toolbar: { show: false },
        background: 'transparent',
        animations: { enabled: true, speed: 400 },
      },

      plotOptions: {
        bar: {
          borderRadius: 6,
          borderRadiusApplication: 'around',
          horizontal: false,
          columnWidth: '55%',
          // highlight current month with a distinct fill via distributed colors
          distributed: false,
        },
      },

      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },

      dataLabels: {
        enabled: true,
        formatter: (val: number) => val.toLocaleString(),
        offsetY: -20,
        style: {
          fontSize: '11px',
          fontFamily: 'var(--font)',
          colors: ['var(--muted)'],
        },
      },

      fill: {
        colors: points.map((p) => (p.isCurrent ? 'var(--purple-lt)' : 'var(--purple)')),
        opacity: points.map((p) => (p.isCurrent ? 1 : 0.7)),
      },

      grid: {
        borderColor: 'var(--border)',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { top: 20, right: 10, bottom: 0, left: 10 },
      },

      xaxis: {
        categories: points.map((p) => p.month),
        axisBorder: { show: true, color: 'var(--border)' },
        axisTicks: { show: false },
        labels: {
          style: { colors: 'var(--muted)', fontSize: '12px', fontFamily: 'var(--font)' },
        },
      },

      yaxis: {
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: 'var(--muted)', fontSize: '12px', fontFamily: 'var(--font)' },
          formatter: (val: number) => `${Math.round(val / 1000)} ألف`,
        },
      },

      tooltip: {
        theme: 'dark',
        style: { fontSize: '13px', fontFamily: 'var(--font)' },
        y: { formatter: (val: number) => `${val.toLocaleString()} جنيه` },
      },

      states: {
        hover: { filter: { type: 'lighten' } },
        active: { filter: { type: 'darken' } },
      },
    };
  });
}