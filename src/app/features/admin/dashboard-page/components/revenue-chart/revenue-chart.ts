import { Component, computed, inject, input } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { RevenuePointDto } from '../../../../../core/Models/Admin/dashboardmodel';
import { DecimalPipe } from '@angular/common';
import { ChartOptions } from '../../../../../core/Models/Admin/activity-ui.model';

@Component({
  selector: 'app-revenue-chart',
  imports: [NgApexchartsModule, DecimalPipe],
  providers: [DecimalPipe],
  templateUrl: './revenue-chart.html',
})
export class RevenueChart {
  readonly data = input.required<RevenuePointDto[]>();
  readonly weeklyTotal = input.required<number>();
  private readonly numberPipe = inject(DecimalPipe);
  readonly loading = input(false);

  readonly chartOptions = computed<ChartOptions>(() => {
    const points = this.data();

    return {
      series: [{ name: 'الإيرادات', data: points.map((p) => p.amount) }],

      colors: ['var(--purple)'],

      chart: {
        type: 'bar',
        height: 320,
        fontFamily: 'var(--font)',
        toolbar: { show: false },
        background: 'transparent',
        animations: { enabled: true, speed: 400 },
      },

      plotOptions: {
        bar: {
          borderRadius: 8,
          borderRadiusApplication: 'around',
          horizontal: false,
          columnWidth: '55%',
          distributed: false,
        },
      },

      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },

      dataLabels: {
        enabled: false,
      },

      fill: {
        colors: points.map((p) => (p.isToday ? 'var(--purple-lt)' : 'var(--purple)')),
        opacity: points.map((p) => (p.isToday ? 1 : 0.55)),
      },

      grid: {
        borderColor: 'var(--border)',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { top: 20, right: 10, bottom: 0, left: 10 },
      },

      xaxis: {
        categories: points.map((p) => (p.isToday ? `${p.day} (اليوم)` : p.day)),
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
          formatter: (val: number) => this.numberPipe.transform(Math.round(val)) ?? '',
        },
      },

      tooltip: {
        theme: 'dark',
        style: { fontSize: '13px', fontFamily: 'var(--font)' },
        y: { formatter: (val: number) => `${this.numberPipe.transform(val) ?? ''} جنيه` },
      },

      states: {
        hover: { filter: { type: 'lighten' } },
        active: { filter: { type: 'darken' } },
      },
    };
  });
}
