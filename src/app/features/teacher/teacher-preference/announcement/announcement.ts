import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-announcement',
  imports: [FormsModule],
  templateUrl: './announcement.html',
})
export class AnnouncementComponent implements OnInit {
  readonly ANN_KEY = 'foundry-announcement';
  readonly MAX_CHARS = 500;

  public readonly annText = signal('');
  public readonly activeAnn = signal('');
  public readonly publishing = signal(false);
  public readonly unpublishing = signal(false);
  public readonly hasError = signal(false);
  public readonly publishToast = signal(false);
  public readonly unpublishToast = signal(false);

  ngOnInit() {
    this.activeAnn.set(localStorage.getItem(this.ANN_KEY) || '');
    this.annText.set(this.activeAnn());
  }

  protected readonly charCount = computed(() => {
    return this.annText().length;
  });

  protected isActive = computed(() => {
    return !!this.activeAnn();
  });

  protected readonly btnLabel = computed(() => {
    return this.isActive() ? 'تعديل الإعلان' : 'نشر الإعلان';
  });

  onInput() {
    this.hasError.set(false);
  }

  publish() {
    const txt = this.annText().trim();
    if (!txt) {
      this.hasError.set(true);
      return;
    }
    this.publishing.set(true);
    setTimeout(() => {
      localStorage.setItem(this.ANN_KEY, txt);
      this.activeAnn.set(txt);
      this.publishing.set(false);
      this.flash('publish');
    }, 1200);
  }

  unpublish() {
    this.unpublishing.set(true);
    setTimeout(() => {
      localStorage.removeItem(this.ANN_KEY);
      this.activeAnn.set('');
      this.annText.set('');
      this.unpublishing.set(false);
      this.flash('unpublish');
    }, 800);
  }

  private flash(type: 'publish' | 'unpublish') {
    if (type === 'publish') {
      this.publishToast.set(true);
      setTimeout(() => this.publishToast.set(false), 2400);
    } else {
      this.unpublishToast.set(true);
      setTimeout(() => this.unpublishToast.set(false), 2400);
    }
  }
}
