import { RoleFilter } from './activity-log.model';

/** A filter chip definition */
export interface ChipDef {
  id: RoleFilter;
  label: string;
}

/** Config for rendering an action icon in the activity log table */
export interface ActionIconConfig {
  icon: string;
  bgClass: string;
  colorClass: string;
}

/** A KPI tile displayed in the activity-log KPI strip */
export interface KpiTile {
  label: string;
  value: number;
  sub: string;
  valueColorClass: string;
  accentBorderClass: string;
}

/** Static display config for a dashboard KPI tile */
export interface KpiStaticConfig {
  label: string;
  unit?: string;
  animated: boolean;
  borderClass: string;
  deltaClass: string;
}

/** Role metadata used by the role-meta pipe */
export interface RoleMeta {
  label: string;
  pillClasses: string;
  avatarClasses: string;
  icon: string | null;
}

/** Status metadata used by the status-meta pipe */
export interface StatusMeta {
  label: string;
  classes: string;
}

/** ApexCharts chart options object shape */
export interface ChartOptions {
  series: import('ng-apexcharts').ApexAxisChartSeries;
  chart: import('ng-apexcharts').ApexChart;
  xaxis: import('ng-apexcharts').ApexXAxis;
  yaxis: import('ng-apexcharts').ApexYAxis;
  dataLabels: import('ng-apexcharts').ApexDataLabels;
  grid: import('ng-apexcharts').ApexGrid;
  fill: import('ng-apexcharts').ApexFill;
  stroke: import('ng-apexcharts').ApexStroke;
  tooltip: import('ng-apexcharts').ApexTooltip;
  plotOptions: import('ng-apexcharts').ApexPlotOptions;
  states: import('ng-apexcharts').ApexStates;
  colors: string[];
}
