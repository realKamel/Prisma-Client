import { Injector, Service, inject, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Service()
export class CustomTitleStrategy extends TitleStrategy implements OnDestroy {
  private titleSubscription?: Subscription;
  private translateService?: TranslateService;

  constructor() {
    super();
  }

  private readonly injector = inject(Injector);
  private readonly titleService = inject(Title);

  override updateTitle(routerState: RouterStateSnapshot): void {
    const titleKey = this.buildTitle(routerState);
    this.titleSubscription?.unsubscribe();

    if (titleKey) {
      // Lazily resolve TranslateService only when a route change occurs
      if (!this.translateService) {
        this.translateService = this.injector.get(TranslateService);
      }

      this.titleSubscription = this.translateService
        .stream(titleKey)
        .subscribe((translatedTitle: string) => {
          this.titleService.setTitle(translatedTitle);
        });
    } else {
      this.titleService.setTitle('Prisma');
    }
  }

  ngOnDestroy(): void {
    this.titleSubscription?.unsubscribe();
  }
}
