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
  bootstrapPersonFill,
  bootstrapTrash,
  bootstrapZoomIn,
  bootstrapZoomOut,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';
import type { CropperImage, CropperSelection } from 'cropperjs';
import { EVENT_TRANSFORM } from 'cropperjs';

const RATIO = 1;
const OUT_SIZE = 800;
const MAX_ZOOM = 3;
const MAX_FILE_MB = 10;
/** Part of the largest square the crop rectangle starts with. */
const INITIAL_COVERAGE = 0.9;

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

interface CropSource {
  url: string;
  name: string;
  type: string;
}

interface ErrorMessage {
  key: string;
  params?: Record<string, unknown>;
}

/**
 * Square picture picker + cropper for the teacher profile.
 *
 * Unlike the lesson cover editor it never paints a background and never converts PNGs to JPEG:
 * transparent cutouts stay transparent. JPEG stays JPEG; PNG/WebP are written as WebP (alpha
 * preserved), falling back to PNG in browsers that can't encode WebP.
 *
 * It only picks and crops. The parent owns the file, the preview URL and the upload.
 */
@Component({
  selector: 'app-profile-picture-editor',
  imports: [NgIcon, TranslatePipe],
  templateUrl: './profile-picture-editor.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  viewProviders: [
    provideIcons({
      bootstrapCheckLg,
      bootstrapCloudArrowUp,
      bootstrapPersonFill,
      bootstrapTrash,
      bootstrapZoomIn,
      bootstrapZoomOut,
    }),
  ],
})
export class ProfilePictureEditorComponent {
  /** What to show in the tile (a server URL or the parent's local preview). */
  public readonly url = input<string | null>(null);
  public readonly disabled = input(false);
  public readonly picked = output<File>();
  public readonly removed = output<void>();

  protected readonly accept = ACCEPTED_TYPES.join(',');
  protected readonly maxFileMb = MAX_FILE_MB;
  protected readonly maxZoom = MAX_ZOOM;
  /** Checkerboard so transparent areas of a cutout are visible. */
  protected readonly checkerStyle = {
    'background-image': 'repeating-conic-gradient(#88888855 0 25%, transparent 0 50%)',
    'background-size': '16px 16px',
  };

  protected readonly error = signal<ErrorMessage | null>(null);
  protected readonly source = signal<CropSource | null>(null);
  protected readonly zoom = signal(1);
  protected readonly busy = signal(false);

  private readonly cropperImage = viewChild<ElementRef<CropperImage>>('cropperImage');
  private readonly cropperSelection = viewChild<ElementRef<CropperSelection>>('cropperSelection');

  /** Scale cropper.js applies while fitting the image, i.e. zoom level 1. */
  private fitScale = 0;
  private clampingZoom = false;

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

    inject(DestroyRef).onDestroy(() => {
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

    if (!ACCEPTED_TYPES.includes(file.type)) {
      this.error.set({ key: 'TEACHER_PROFILE_PAGE.PICTURE.NOT_IMAGE' });
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      this.error.set({ key: 'TEACHER_PROFILE_PAGE.PICTURE.TOO_LARGE', params: { max: MAX_FILE_MB } });
      return;
    }
    this.error.set(null);

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      this.zoom.set(1);
      this.fitScale = 0;
      this.source.set({ url, name: file.name, type: file.type });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      this.error.set({ key: 'TEACHER_PROFILE_PAGE.PICTURE.UNREADABLE' });
    };
    img.src = url;
  }

  protected remove(): void {
    this.error.set(null);
    this.removed.emit();
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

    // Largest square inside the image, inset a bit so it can also be moved around
    const side = Math.min(imageRect.width, imageRect.height) * INITIAL_COVERAGE;
    const frameRect = frame.getBoundingClientRect();
    selection.$change(
      imageRect.left - frameRect.left + (imageRect.width - side) / 2,
      imageRect.top - frameRect.top + (imageRect.height - side) / 2,
      side,
      side,
      RATIO,
      true,
    );
  }

  /** Waits for cropper.js to fit the image and returns that "zoom level 1" scale. */
  private async fitImage(image: CropperImage, frame: Element): Promise<number> {
    const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const ready = () => (image as unknown as { $isReady?: boolean }).$isReady === true;

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
    const image = this.cropperImage()?.nativeElement;
    const frame = image?.parentElement;
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

    const side = Math.min(selection.width, maxWidth, maxHeight);
    if (!side) return;

    const x = Math.min(Math.max(selection.x, inset.left), frameRect.width - inset.right - side);
    const y = Math.min(Math.max(selection.y, inset.top), frameRect.height - inset.bottom - side);

    if (x !== selection.x || y !== selection.y || side !== selection.width || side !== selection.height) {
      selection.$change(x, y, side, side, RATIO, true);
    }
  }

  protected onImageTransform(event: Event): void {
    if (!this.fitScale) return;

    const scale = (event as CustomEvent<{ matrix?: number[] }>).detail?.matrix?.[0];
    if (!scale) return;

    const ratio = scale / this.fitScale;

    // Cancelling the event makes cropper.js revert the transform
    const limit = ratio > MAX_ZOOM + 0.001 ? MAX_ZOOM : ratio < 1 - 0.001 ? 1 : null;
    if (limit !== null) {
      event.preventDefault();
      if (!this.clampingZoom) {
        this.clampingZoom = true;
        try {
          this.applyZoom(limit);
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

  // ── Confirm / cancel ─────────────────────────────────────────────
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
      const size = Math.max(1, Math.min(OUT_SIZE, Math.round(sourceWidth)));
      const rendered = await selection.$toCanvas({ width: size });

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return this.fail();

      // JPEG has no alpha, so it needs a solid base. PNG/WebP must stay transparent.
      const keepJpeg = s.type === 'image/jpeg';
      if (keepJpeg) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, size, size);
      }
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(rendered, 0, 0, size, size);

      const wanted = keepJpeg ? 'image/jpeg' : 'image/webp';
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, wanted, 0.92),
      );
      if (!blob) return this.fail();

      // Browsers that can't encode WebP silently return a PNG, so trust the blob's own type.
      const type = blob.type || wanted;
      const name = `${s.name.replace(/\.[^.]+$/, '')}.${EXTENSIONS[type] ?? 'png'}`;

      this.picked.emit(new File([blob], name, { type }));
      this.error.set(null);
      this.closeEditor();
    } catch {
      this.fail();
    } finally {
      this.busy.set(false);
    }
  }

  protected cancel(): void {
    this.closeEditor();
  }

  private fail(): void {
    this.error.set({ key: 'TEACHER_PROFILE_PAGE.PICTURE.PROCESS_FAILED' });
  }

  private closeEditor(): void {
    const s = this.source();
    if (s) URL.revokeObjectURL(s.url);
    this.source.set(null);
    this.fitScale = 0;
  }
}