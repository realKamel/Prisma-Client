import { Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
import {
  bootstrapImage,
  bootstrapCloudArrowUp,
  bootstrapXLg,
  bootstrapCheckLg,
  bootstrapZoomIn,
  bootstrapZoomOut,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

const RATIO = 16 / 9;
const OUT_WIDTH = 1280;
const MAX_ZOOM = 3;
const MAX_FILE_MB = 10;

interface CropSource {
  url: string;
  name: string;
  aspect: number; // natural width / height
}

@Component({
  selector: 'app-image-upload',
  imports: [NgIcon],
  templateUrl: './image-upload.html',
  viewProviders: [
    provideIcons({
      bootstrapImage,
      bootstrapCloudArrowUp,
      bootstrapXLg,
      bootstrapCheckLg,
      bootstrapZoomIn,
      bootstrapZoomOut,
    }),
  ],
})
export class ImageUpload {
  readonly initialPreview = input<string | null>(null);
  readonly fileSelected = output<File | null>();

  readonly preview = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  // Crop editor state
  protected readonly source = signal<CropSource | null>(null);
  protected readonly zoom = signal(1);
  /** Center of the visible area, as a fraction (0..1) of the image. */
  protected readonly center = signal({ x: 0.5, y: 0.5 });
  protected readonly thirds = Array.from({ length: 9 }, (_, i) => i);

  /** Image box size as a % of the 16:9 frame. At zoom 1 it just covers the frame. */
  private readonly size = computed(() => {
    const a = this.source()?.aspect ?? RATIO;
    const z = this.zoom();
    return { w: 100 * z * Math.max(1, a / RATIO), h: 100 * z * Math.max(1, RATIO / a) };
  });
  protected readonly imgW = computed(() => this.size().w);
  protected readonly imgH = computed(() => this.size().h);
  protected readonly imgLeft = computed(() => 50 - this.center().x * this.size().w);
  protected readonly imgTop = computed(() => 50 - this.center().y * this.size().h);

  private image: HTMLImageElement | null = null;
  private ownedPreviewUrl: string | null = null;
  private drag: { x: number; y: number; cx: number; cy: number; imgW: number; imgH: number } | null =
    null;

  constructor() {
    effect(() => {
      const url = this.initialPreview();
      if (url) this.setPreview(url);
    });

    inject(DestroyRef).onDestroy(() => {
      if (this.ownedPreviewUrl) URL.revokeObjectURL(this.ownedPreviewUrl);
      const s = this.source();
      if (s) URL.revokeObjectURL(s.url);
    });
  }

  // ── File selection ───────────────────────────────────────────────
  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // lets the user pick the same file again
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error.set('الملف يجب أن يكون صورة');
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      this.error.set(`حجم الصورة يجب أن يكون أقل من ${MAX_FILE_MB} ميجابايت`);
      return;
    }
    this.error.set(null);

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      this.image = img;
      this.zoom.set(1);
      this.center.set({ x: 0.5, y: 0.5 });
      this.source.set({ url, name: file.name, aspect: img.naturalWidth / img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      this.error.set('تعذر قراءة هذه الصورة، جرّب صورة أخرى');
    };
    img.src = url;
  }

  // ── Dragging and zooming ─────────────────────────────────────────
  protected onPointerDown(e: PointerEvent): void {
    const frame = e.currentTarget as HTMLElement;
    frame.setPointerCapture(e.pointerId);
    const rect = frame.getBoundingClientRect();
    const { w, h } = this.size();
    this.drag = {
      x: e.clientX,
      y: e.clientY,
      cx: this.center().x,
      cy: this.center().y,
      imgW: (rect.width * w) / 100,
      imgH: (rect.height * h) / 100,
    };
  }

  protected onPointerMove(e: PointerEvent): void {
    const d = this.drag;
    if (!d) return;
    this.center.set(
      this.clamp(d.cx - (e.clientX - d.x) / d.imgW, d.cy - (e.clientY - d.y) / d.imgH),
    );
  }

  protected onPointerEnd(): void {
    this.drag = null;
  }

  protected onWheel(e: WheelEvent): void {
    e.preventDefault();
    this.setZoom(this.zoom() - e.deltaY * 0.002);
  }

  protected setZoom(value: number): void {
    this.zoom.set(Math.min(MAX_ZOOM, Math.max(1, value)));
    this.center.update((c) => this.clamp(c.x, c.y)); // keep the frame covered
  }

  /** Keeps the visible area inside the image. */
  private clamp(x: number, y: number): { x: number; y: number } {
    const { w, h } = this.size();
    const halfW = 50 / w;
    const halfH = 50 / h;
    return {
      x: Math.min(1 - halfW, Math.max(halfW, x)),
      y: Math.min(1 - halfH, Math.max(halfH, y)),
    };
  }

  // ── Confirm / cancel / clear ─────────────────────────────────────
  protected confirm(): void {
    const s = this.source();
    const img = this.image;
    if (!s || !img) return;

    const { w, h } = this.size();
    const { x, y } = this.center();

    // The exact rectangle (in source pixels) that is visible in the frame
    const sw = (100 / w) * img.naturalWidth;
    const sh = (100 / h) * img.naturalHeight;
    const sx = Math.max(0, Math.min(x * img.naturalWidth - sw / 2, img.naturalWidth - sw));
    const sy = Math.max(0, Math.min(y * img.naturalHeight - sh / 2, img.naturalHeight - sh));

    // Never upscale: a small source gives a smaller 16:9 output
    const outW = Math.min(OUT_WIDTH, Math.round(sw));
    const outH = Math.round(outW / RATIO);

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#fff'; // transparent PNGs become white instead of black
    ctx.fillRect(0, 0, outW, outH);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          this.error.set('تعذر معالجة الصورة، حاول مرة أخرى');
          return;
        }
        const name = s.name.replace(/\.[^.]+$/, '') + '.jpg';
        this.setPreview(URL.createObjectURL(blob), true);
        this.fileSelected.emit(new File([blob], name, { type: 'image/jpeg' }));
        this.closeEditor();
      },
      'image/jpeg',
      0.9,
    );
  }

  protected cancel(): void {
    this.closeEditor();
  }

  protected clear(): void {
    this.setPreview(null);
    this.error.set(null);
    this.fileSelected.emit(null);
  }

  private closeEditor(): void {
    const s = this.source();
    if (s) URL.revokeObjectURL(s.url);
    this.source.set(null);
    this.image = null;
  }

  private setPreview(url: string | null, owned = false): void {
    if (this.ownedPreviewUrl) URL.revokeObjectURL(this.ownedPreviewUrl);
    this.ownedPreviewUrl = owned ? url : null;
    this.preview.set(url);
  }
}