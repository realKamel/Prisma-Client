import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  bootstrapBookHalf,
  bootstrapGrid1x2Fill,
  bootstrapMortarboard,
  bootstrapPatchQuestionFill,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { AuthService } from '../../../../core/services/auth/auth';
@Component({
  selector: 'app-not-found',
  imports: [RouterModule, NgIcon],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
  viewProviders: [
    provideIcons({
      bootstrapMortarboard,
      bootstrapPatchQuestionFill,
      bootstrapBookHalf,
      bootstrapGrid1x2Fill,
    }),
  ],
})
export class NotFound {
  public readonly auth = inject(AuthService);
}
