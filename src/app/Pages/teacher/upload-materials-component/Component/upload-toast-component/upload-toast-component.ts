import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-toast-component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class UploadToastComponent {
  @Input() message: string | null = null;
}