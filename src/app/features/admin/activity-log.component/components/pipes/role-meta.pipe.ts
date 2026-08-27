import { Pipe, PipeTransform } from '@angular/core';
import { ActorRole } from '../../../../../core/Models/Admin/activity-log.model';
import { RoleMeta } from '../../../../../core/Models/Admin/activity-ui.model';

const PILL_BASE =
  'inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap';
const AVATAR_BASE =
  'w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold';

// Same colors as the original design system (var(--purple-lt), var(--mint), etc.)
// — only the delivery mechanism changed from custom CSS classes to Tailwind
// arbitrary-value utilities referencing the same CSS variables.
const ROLE_META: Record<ActorRole, RoleMeta> = {
  teacher: {
    label: 'معلم',
    pillClasses: `${PILL_BASE} bg-[rgba(var(--accent-rgb),0.14)] text-primary-light`,
    avatarClasses: `${AVATAR_BASE} bg-[rgba(var(--accent-rgb),0.16)] text-primary-light`,
    icon: null,
  },
  assistant: {
    label: 'مساعد',
    pillClasses: `${PILL_BASE} bg-[rgba(160,144,208,0.14)] text-[#c0b0e8]`,
    avatarClasses: `${AVATAR_BASE} bg-[rgba(160,144,208,0.12)] text-[#c0b0e8]`,
    icon: null,
  },
  student: {
    label: 'طالب',
    pillClasses: `${PILL_BASE} bg-[rgba(78,203,141,0.14)] text-mint`,
    avatarClasses: `${AVATAR_BASE} bg-[rgba(78,203,141,0.14)] text-mint`,
    icon: null,
  },
  admin: {
    label: 'مدير',
    pillClasses: `${PILL_BASE} bg-[rgba(240,106,106,0.14)] text-coral`,
    avatarClasses: `${AVATAR_BASE} bg-[rgba(240,106,106,0.14)] text-coral`,
    icon: null,
  },
  system: {
    label: 'نظام',
    pillClasses: `${PILL_BASE} bg-[rgba(145,144,168,0.14)] text-muted`,
    avatarClasses: `${AVATAR_BASE} bg-[rgba(145,144,168,0.12)] text-muted`,
    icon: 'bootstrapPcDisplay',
  },
};

@Pipe({ name: 'roleMeta', standalone: true })
export class RoleMetaPipe implements PipeTransform {
  transform(role: ActorRole): RoleMeta {
    return ROLE_META[role] ?? ROLE_META.system;
  }
}
