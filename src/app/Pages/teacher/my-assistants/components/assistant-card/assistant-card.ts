import { Component, input } from '@angular/core';
import { PermissionButton } from '../permission-button/permission-button';
import { Assistant, AssistantPermissions } from '../../assistants.model';

@Component({
  selector: 'app-assistant-card',
  imports: [PermissionButton],
  templateUrl: './assistant-card.html',
  styleUrl: './assistant-card.css',
})
export class AssistantCard {
  public assistantInfo = input.required<Assistant>();
  public requestDelete() {}
  public permissions: AssistantPermissions[] = [];
}
