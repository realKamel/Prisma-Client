import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-upload-toast',
  imports: [],
  templateUrl: './upload-toast-component.html',
})
export class UploadToastComponent {
  readonly message = input<string | null>(null);
}
