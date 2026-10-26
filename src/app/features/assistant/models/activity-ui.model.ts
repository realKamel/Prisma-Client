/** A filter chip definition for the assistant activity log */
export interface Chip<T = string> {
  key: T;
  label: string;
  icon: string;
  count: number;
}

/** A KPI tile displayed in the assistant activity-log KPI strip */
export interface KpiTile {
  label: string;
  value: number;
  sub: string;
  valueColorClass: string;
  accentBorderClass: string;
}
