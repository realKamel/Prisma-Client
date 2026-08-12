import { Component, computed, input, output } from '@angular/core';
import { CreateOrUpdateAssistantCommandResponse, PolicyEnum } from '../../assistants.model';

interface PolicyDisplay {
  key: PolicyEnum;
  title: string;
}

@Component({
  selector: 'app-assistant-card',
  templateUrl: './assistant-card.html',
})
export class AssistantCard {
  assistantInfo = input.required<CreateOrUpdateAssistantCommandResponse>();
  theme = input<{ bg: string; text: string }>();
  isUpdating = input(false);
  updatingPolicy = input<PolicyEnum | null>(null);

  deleteRequest = output<void>();
  togglePermission = output<PolicyEnum>();

  protected readonly fullName = computed(
    () => `${this.assistantInfo().firstName} ${this.assistantInfo()?.secondName ?? ''}`,
  );

  protected readonly initials = computed(() => {
    const f = this.assistantInfo().firstName?.[0] ?? '';
    const s = this.assistantInfo().secondName?.[0] ?? '';
    return (f + s).toUpperCase();
  });

  protected readonly permissionList: PolicyDisplay[] = [
    { key: PolicyEnum.CanManageContent, title: 'إدارة محتوي الدروس' },
    { key: PolicyEnum.CanManageAssessments, title: 'إدارة الاختبارات' },
    { key: PolicyEnum.CanEvaluateStudents, title: 'التصحيح والتقييم' },
    { key: PolicyEnum.CanManageEnrollments, title: 'إدارة الطلاب' },
    { key: PolicyEnum.CanViewReports, title: 'ادارة التقارير' },
  ];

  protected hasPermission(key: PolicyEnum): boolean {
    return this.assistantInfo().policies?.includes(key) ?? false;
  }

  protected isPolicyUpdating(key: PolicyEnum): boolean {
    return this.isUpdating() && this.updatingPolicy() === key;
  }
  protected onToggle(key: PolicyEnum): void {
    this.togglePermission.emit(key);
  }

  protected onDelete(): void {
    this.deleteRequest.emit();
  }
}
