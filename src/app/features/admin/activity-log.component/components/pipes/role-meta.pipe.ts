import { Pipe, PipeTransform } from '@angular/core';
// import { ActorRole } from '../../../../../core/Models/Admin/activity-log.model';
import { RoleMeta } from '../../../../../core/Models/Admin/activity-ui.model';
import { AppRole } from '../../../../../core/types/app-role';

// Same colors as the original design system (var(--color-primary-light), var(--color-mint), etc.)
// — only the delivery mechanism changed from custom CSS classes to Tailwind
// arbitrary-value utilities referencing the same CSS variables.

@Pipe({ name: 'roleMeta' })
export class RoleMetaPipe implements PipeTransform {
  private readonly PILL_BASE =
    'inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap';
  private readonly AVATAR_BASE =
    'w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold';
  private readonly ROLE_META: Record<Exclude<AppRole, 'guest'>, RoleMeta> = {
    teacher: {
      label: 'معلم',
      pillClasses: `${this.PILL_BASE} bg-[rgba(var(--color-primary-rgb),0.14)] text-primary-light`,
      avatarClasses: `${this.AVATAR_BASE} bg-[rgba(var(--color-primary-rgb),0.16)] text-primary-light`,
      icon: null,
    },
    assistant: {
      label: 'مساعد',
      pillClasses: `${this.PILL_BASE} bg-[rgba(160,144,208,0.14)] text-[#c0b0e8]`,
      avatarClasses: `${this.AVATAR_BASE} bg-[rgba(160,144,208,0.12)] text-[#c0b0e8]`,
      icon: 'lucideUsersRound ',
    },
    student: {
      label: 'طالب',
      pillClasses: `${this.PILL_BASE} bg-mint/10 text-mint`,
      avatarClasses: `${this.AVATAR_BASE} bg-mint/10 text-mint`,
      icon: 'phosphorStudentBold ',
    },
    admin: {
      label: 'مدير',
      pillClasses: `${this.PILL_BASE} bg-coral/10 text-coral`,
      avatarClasses: `${this.AVATAR_BASE} bg-coral/10 text-coral`,
      icon: 'lucideUserCog',
    },
    system: {
      label: 'نظام',
      pillClasses: `${this.PILL_BASE} bg-gray-200 text-muted`,
      avatarClasses: `${this.AVATAR_BASE} bg-gray-200 text-muted`,
      icon: 'bootstrapPcDisplay',
    },
  };

  public transform(role: AppRole): RoleMeta {
    return this.ROLE_META[role as Exclude<AppRole, 'guest'>] ?? this.ROLE_META.system;
  }
}
