import { Component, model } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';

@Component({
  selector: 'app-auth-buttons',
  imports: [RouterLink, TranslatePipe, NgmMotionDirective],
  templateUrl: './auth-buttons.html',
  styleUrl: './auth-buttons.css',
})
export class AuthButtons {
  public readonly isSideBarOpen = model<boolean>();
}
