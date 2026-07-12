import { Component, inject } from '@angular/core';
import { StatusService } from '../../core/Services/status';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-status-bar',
  imports: [],
  templateUrl: './status-bar.html',
  styleUrl: './status-bar.css',
})
export class StatusBar {
  // private statusService = inject(StatusService);
  // stats = toSignal(
  //   this.statusService.getStatus(),
  //   {
  //     initialValue: []
  //   }
  // );
}
