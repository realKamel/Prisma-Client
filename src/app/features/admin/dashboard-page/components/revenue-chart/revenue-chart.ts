import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { ChartComponent } from 'ng-apexcharts';
import { ChartOptions } from '../../../../../core/Models/Admin/activity-ui.model';
import { RevenuePointDto } from '../../../../../core/Models/Admin/dashboardmodel';

@Component({
  selector: 'app-revenue-chart',
  imports: [ChartComponent, DecimalPipe, NgmMotionDirective, TranslatePipe],
  providers: [DecimalPipe, DatePipe],
  templateUrl: './revenue-chart.html',
})
export class RevenueChartComponent {
  public readonly data = input.required<RevenuePointDto[]>();
  public readonly weeklyTotal = input.required<number>();
  private readonly numberPipe = inject(DecimalPipe);
  private readonly datePipe = inject(DatePipe);
  private readonly translate = inject(TranslateService);
  public readonly loading = input(false);

  private readonly seriesName = this.translate.translate(
    'ADMIN_DASHBOARD.REVENUE_CHART.SERIES_NAME',
  );
  private readonly todaySuffix = this.translate.translate(
    'ADMIN_DASHBOARD.REVENUE_CHART.TODAY_SUFFIX',
  );
  private readonly currencyLabel = this.translate.translate('COMMON.CURRENCY_EGP');

  protected readonly chartOptions = computed<ChartOptions>(() => {
    const points = this.data().map((x) => ({
      ...x,
      day: this.datePipe.transform(x.day, 'dd/MM') ?? '',
    }));

    return {
      series: [{ name: this.seriesName() as string, data: points.map((p) => p.amount) }],

      colors: ['var(--color-primary)'],

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
        colors: points.map((p) =>
          p.isToday ? 'var(--color-primary-light)' : 'var(--color-primary)',
        ),
        opacity: points.map((p) => (p.isToday ? 1 : 0.55)),
      },

      grid: {
        borderColor: 'var(--color-border)',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { top: 20, right: 10, bottom: 0, left: 10 },
      },

      xaxis: {
        categories: points.map((p) =>
          p.isToday ? `${p.day} ${this.todaySuffix() as string}` : p.day,
        ),
        axisBorder: { show: true, color: 'var(--color-border)' },
        axisTicks: { show: false },
        labels: {
          style: { colors: 'var(--color-muted)', fontSize: '12px', fontFamily: 'var(--font)' },
        },
      },

      yaxis: {
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: 'var(--color-muted)', fontSize: '12px', fontFamily: 'var(--font)' },
          formatter: (val: number) => this.numberPipe.transform(Math.round(val)) ?? '',
        },
      },

      tooltip: {
        theme: 'dark',
        style: { fontSize: '13px', fontFamily: 'var(--font)' },
        y: {
          formatter: (val: number) =>
            `${this.numberPipe.transform(val) ?? ''} ${this.currencyLabel() as string}`,
        },
      },

      states: {
        hover: { filter: { type: 'lighten' } },
        active: { filter: { type: 'darken' } },
      },
    };
  });
}
