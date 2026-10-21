import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  bootstrapCheckLg,
  bootstrapCloudArrowUp,
  bootstrapImage,
  bootstrapXLg,
  bootstrapZoomIn,
  bootstrapZoomOut,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import type { CropperImage, CropperSelection } from 'cropperjs';
import { EVENT_TRANSFORM } from 'cropperjs';

const RATIO = 16 / 9;
const OUT_WIDTH = 1280;
const MAX_ZOOM = 3;
const MAX_FILE_MB = 10;
/** Part of the largest 16:9 area the crop rectangle starts with. */
const INITIAL_COVERAGE = 0.9;

interface CropSource {
  url: string;
  name: string;
}

@Component({
  selector: 'app-image-upload',
  imports: [NgIcon],
  templateUrl: './image-upload.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
export class ImageUploadComponent {
  public readonly initialPreview = input<string | null>(null);
  public readonly fileSelected = output<File | null>();

  protected readonly preview = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly source = signal<CropSource | null>(null);
  protected readonly zoom = signal(1);
  protected readonly busy = signal(false);
  protected readonly maxZoom = MAX_ZOOM;

  private readonly cropperImage = viewChild<ElementRef<CropperImage>>('cropperImage');
  private readonly cropperSelection = viewChild<ElementRef<CropperSelection>>('cropperSelection');

  /** Scale cropper.js applies while fitting the image, i.e. zoom level 1. */
  private fitScale = 0;
  private clampingZoom = false;
  private ownedPreviewUrl: string | null = null;

  constructor() {
    effect((onCleanup) => {
      const image = this.cropperImage()?.nativeElement;
      const selection = this.cropperSelection()?.nativeElement;
      if (!image || !selection) return;

      let active = true;
      const onTransform = (event: Event) => this.onImageTransform(event);

      image.addEventListener(EVENT_TRANSFORM, onTransform);
      void this.setupEditor(image, selection, () => active);

      onCleanup(() => {
        active = false;
        image.removeEventListener(EVENT_TRANSFORM, onTransform);
      });
    });

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
      this.zoom.set(1);
      this.fitScale = 0;
      this.source.set({ url, name: file.name });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      this.error.set('تعذر قراءة هذه الصورة، جرّب صورة أخرى');
    };
    img.src = url;
  }

  // ── Crop editor ──────────────────────────────────────────────────
  private async setupEditor(
    image: CropperImage,
    selection: CropperSelection,
    isActive: () => boolean,
  ): Promise<void> {
    try {
      await image.$ready();
    } catch {
      return;
    }

    const frame = image.parentElement;
    if (!frame) return;

    // cropper.js sizes and fits the image asynchronously; measuring before that gives
    // the raw natural size and the crop box lands outside the frame
    this.fitScale = await this.fitImage(image, frame);
    if (!isActive()) return;

    const imageRect = image.getBoundingClientRect();
    if (!imageRect.width || !imageRect.height) return;

    this.syncSelectionBounds();

    // Largest 16:9 area inside the image, inset a bit so it can also be moved around
    let width = imageRect.width;
    if (width / RATIO > imageRect.height) width = imageRect.height * RATIO;
    width *= INITIAL_COVERAGE;
    const height = width / RATIO;

    const frameRect = frame.getBoundingClientRect();
    selection.$change(
      imageRect.left - frameRect.left + (imageRect.width - width) / 2,
      imageRect.top - frameRect.top + (imageRect.height - height) / 2,
      width,
      height,
      RATIO,
      true,
    );
  }

  /** Waits for cropper.js to fit the image and returns that "zoom level 1" scale. */
  private async fitImage(image: CropperImage, frame: Element): Promise<number> {
    const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const ready = () => (image as unknown as { $isReady?: boolean }).$isReady === true;

    // $handleLoad() sizes the element to the natural pixels and then fits it ("contain")
    for (let i = 0; i < 30 && !ready(); i += 1) await nextFrame();
    if (!ready()) return image.$getTransform()[0] || 1;

    const natural = image.$image;
    const frameRect = frame.getBoundingClientRect();
    if (!natural.naturalWidth || !frameRect.width || !frameRect.height) {
      return image.$getTransform()[0] || 1;
    }

    const fitScale = Math.min(
      frameRect.width / natural.naturalWidth,
      frameRect.height / natural.naturalHeight,
    );

    // Corrects the fit if cropper.js skipped it (e.g. a rejected transform)
    for (let i = 0; i < 3; i += 1) {
      if (Math.abs(image.$getTransform()[0] - fitScale) < 0.002) break;
      image.$setTransform([fitScale, 0, 0, fitScale, 0, 0]);
      image.$center();
      await nextFrame();
    }

    return image.$getTransform()[0] || fitScale;
  }

  /** Keeps the crop rectangle inside the visible part of the image. */
  private syncSelectionBounds(): void {
    const selection = this.cropperSelection()?.nativeElement;
    const frame = this.cropperImage()?.nativeElement?.parentElement;
    const image = this.cropperImage()?.nativeElement;
    if (!image || !selection || !frame) return;

    const imageRect = image.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    if (!frameRect.width || !frameRect.height) return;

    const inset = {
      top: Math.max(0, imageRect.top - frameRect.top),
      right: Math.max(0, frameRect.right - imageRect.right),
      bottom: Math.max(0, frameRect.bottom - imageRect.bottom),
      left: Math.max(0, imageRect.left - frameRect.left),
    };

    // cropper.js blocks any move/resize that would break these insets
    selection.minInset = `${inset.top}px ${inset.right}px ${inset.bottom}px ${inset.left}px`;

    const maxWidth = frameRect.width - inset.left - inset.right;
    const maxHeight = frameRect.height - inset.top - inset.bottom;
    if (maxWidth <= 0 || maxHeight <= 0) return;

    const width = Math.min(selection.width, maxWidth, maxHeight * RATIO);
    const height = width / RATIO;
    if (!width || !height) return;

    const x = Math.min(Math.max(selection.x, inset.left), frameRect.width - inset.right - width);
    const y = Math.min(Math.max(selection.y, inset.top), frameRect.height - inset.bottom - height);

    if (
      x !== selection.x ||
      y !== selection.y ||
      width !== selection.width ||
      height !== selection.height
    ) {
      selection.$change(x, y, width, height, RATIO, true);
    }
  }

  protected onImageTransform(event: Event): void {
    if (!this.fitScale) return;

    const scale = (event as CustomEvent<{ matrix?: number[] }>).detail?.matrix?.[0];
    if (!scale) return;

    const ratio = scale / this.fitScale;

    // Cancelling the event makes cropper.js revert the transform
    if (ratio > MAX_ZOOM + 0.001) {
      event.preventDefault();
      if (!this.clampingZoom) {
        this.clampingZoom = true;
        try {
          this.applyZoom(MAX_ZOOM);
        } finally {
          this.clampingZoom = false;
        }
      }
      return;
    }
    if (ratio < 1 - 0.001) {
      // Never smaller than the fitted image, otherwise the frame would expose black
      event.preventDefault();
      if (!this.clampingZoom) {
        this.clampingZoom = true;
        try {
          this.applyZoom(1);
        } finally {
          this.clampingZoom = false;
        }
      }
      return;
    }

    this.zoom.set(Math.min(MAX_ZOOM, Math.max(1, ratio)));
    this.syncSelectionBounds();
  }

  protected setZoom(value: number): void {
    this.applyZoom(value);
  }

  private applyZoom(value: number): void {
    const image = this.cropperImage()?.nativeElement;
    if (!image || !this.fitScale) return;

    const target = Math.min(MAX_ZOOM, Math.max(1, value));
    const current = image.$getTransform()[0];
    if (!current) return;

    const factor = (this.fitScale * target) / current;
    if (Math.abs(factor - 1) > 0.001) {
      image.$zoom(factor > 1 ? factor - 1 : 1 - 1 / factor);
    }
    this.zoom.set(target);
  }

  // ── Confirm / cancel / clear ─────────────────────────────────────
  protected async confirm(): Promise<void> {
    const s = this.source();
    const selection = this.cropperSelection()?.nativeElement;
    const image = this.cropperImage()?.nativeElement;
    if (!s || !selection || !image || this.busy()) return;

    // Never upscale: the output is never wider than the cropped source pixels
    const sourceWidth = selection.width / (image.$getTransform()[0] || 1);
    if (!Number.isFinite(sourceWidth) || sourceWidth <= 0) return;

    this.busy.set(true);
    try {
      const outW = Math.max(1, Math.min(OUT_WIDTH, Math.round(sourceWidth)));
      const outH = Math.max(1, Math.round(outW / RATIO));
      const rendered = await selection.$toCanvas({ width: outW });

      // Redraw into an exact 16:9 canvas: the frame's own size can be a pixel off
      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        this.error.set('تعذر معالجة الصورة، حاول مرة أخرى');
        return;
      }
      ctx.fillStyle = '#fff'; // transparent PNGs become white instead of black
      ctx.fillRect(0, 0, outW, outH);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(rendered, 0, 0, outW, outH);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.9),
      );
      if (!blob) {
        this.error.set('تعذر معالجة الصورة، حاول مرة أخرى');
        return;
      }

      const name = s.name.replace(/\.[^.]+$/, '') + '.jpg';
      this.setPreview(URL.createObjectURL(blob), true);
      this.fileSelected.emit(new File([blob], name, { type: 'image/jpeg' }));
      this.error.set(null);
      this.closeEditor();
    } catch {
      this.error.set('تعذر معالجة الصورة، حاول مرة أخرى');
    } finally {
      this.busy.set(false);
    }
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
    this.fitScale = 0;
  }

  private setPreview(url: string | null, owned = false): void {
    if (this.ownedPreviewUrl) URL.revokeObjectURL(this.ownedPreviewUrl);
    this.ownedPreviewUrl = owned ? url : null;
    this.preview.set(url);
  }
}
