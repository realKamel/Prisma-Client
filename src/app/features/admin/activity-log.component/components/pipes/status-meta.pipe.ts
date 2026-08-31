import { Pipe, PipeTransform } from '@angular/core';
import { EventStatus } from '../../../../../core/Models/Admin/activity-log.model';
import { StatusMeta } from '../../../../../core/Models/Admin/activity-ui.model';

const BASE =
  'inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap';

const STATUS_META: Record<EventStatus, StatusMeta> = {
  ok: { label: 'نجاح', classes: `${BASE} bg-[rgba(78,203,141,0.14)] text-mint` },
  warn: { label: 'تحذير', classes: `${BASE} bg-[rgba(247,201,72,0.14)] text-star` },
  error: { label: 'خطأ', classes: `${BASE} bg-[rgba(240,106,106,0.14)] text-coral` },
};

@Pipe({ name: 'statusMeta', standalone: true })
export class StatusMetaPipe implements PipeTransform {
  transform(status: EventStatus): StatusMeta {
    return STATUS_META[status] ?? STATUS_META.ok;
  }
}
