import { Component, viewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-dashboard.html',
})
export class TeacherDashboardComponent implements AfterViewInit {
  // Safe typing for element references running graphics integrations
  chartContainer = viewChild<ElementRef<HTMLDivElement>>('chartContainer');

  ngAfterViewInit(): void {
    const elementNode = this.chartContainer()?.nativeElement;
    if (elementNode) {
      this.initThirdPartyCharts(elementNode);
    }
  }

  private initThirdPartyCharts(element: HTMLDivElement): void {
    /**
     * Hook up your chart rendering pipeline inside this lifecycle method.
     * e.g., using Chart.js, Highcharts, or ApexCharts:
     * * const myChart = new Chart(element, { ...configurationOptions });
     */
  }
}
