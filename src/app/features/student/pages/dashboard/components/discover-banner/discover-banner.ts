import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { bootstrapGrid3x3GapFill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-discover-banner',
  imports: [RouterModule, NgIcon, TranslatePipe],
  templateUrl: './discover-banner.html',
  viewProviders: [
    provideIcons({
      bootstrapGrid3x3GapFill,
    }),
  ],
})
export class DiscoverBanner {}