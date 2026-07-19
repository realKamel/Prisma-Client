import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-announcement',

  imports: [FormsModule],
  templateUrl: './announcement.html',
})
export class AnnouncementComponent implements OnInit {
  readonly ANN_KEY = 'foundry-announcement';
  readonly MAX_CHARS = 500;

  annText = '';
  activeAnn = '';
  publishing = false;
  unpublishing = false;
  hasError = false;
  publishToast = false;
  unpublishToast = false;

  ngOnInit() {
    this.activeAnn = localStorage.getItem(this.ANN_KEY) || '';
    this.annText = this.activeAnn;
  }

  get charCount() {
    return this.annText.length;
  }
  get isActive() {
    return !!this.activeAnn;
  }
  get btnLabel() {
    return this.isActive ? 'تعديل الإعلان' : 'نشر الإعلان';
  }

  onInput() {
    this.hasError = false;
  }

  publish() {
    const txt = this.annText.trim();
    if (!txt) {
      this.hasError = true;
      return;
    }
    this.publishing = true;
    setTimeout(() => {
      localStorage.setItem(this.ANN_KEY, txt);
      this.activeAnn = txt;
      this.publishing = false;
      this.flash('publish');
    }, 1200);
  }

  unpublish() {
    this.unpublishing = true;
    setTimeout(() => {
      localStorage.removeItem(this.ANN_KEY);
      this.activeAnn = '';
      this.annText = '';
      this.unpublishing = false;
      this.flash('unpublish');
    }, 800);
  }

  private flash(type: 'publish' | 'unpublish') {
    if (type === 'publish') {
      this.publishToast = true;
      setTimeout(() => (this.publishToast = false), 2400);
    } else {
      this.unpublishToast = true;
      setTimeout(() => (this.unpublishToast = false), 2400);
    }
  }
}
