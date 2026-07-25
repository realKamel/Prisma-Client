import { Component, input, model, signal } from '@angular/core';

@Component({
  selector: 'app-permission-button',
  imports: [],
  templateUrl: './permission-button.html',
  styleUrl: './permission-button.css',
})
export class PermissionButton {
  public title = input.required<string>();
  // public description = input<string>();
  public isChecked = model<boolean>();
  // public policyName = input<string>();
  public toggle() {
    this.isChecked.update((prev) => !prev);
  }
}
