import { Component, input } from '@angular/core';

@Component({
  selector: 'app-prisma-icon',
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="animate-pulse-scale"
    >
      <!-- Glass background -->
      <rect
        width="72"
        height="72"
        rx="20"
        fill="var(--badge-bg)"
        stroke="var(--badge-border)"
        stroke-width="1"
      />
      <!-- Soft glass highlight -->
      <rect x="1" y="1" width="70" height="70" rx="19" fill="url(#shine)" fill-opacity="0.4" />
      <!-- P letter -->
      <text
        x="36"
        y="47"
        text-anchor="middle"
        fill="var(--ink)"
        font-size="32"
        font-weight="900"
        font-family="var(--font)"
        dominant-baseline="middle"
      >
        P
      </text>

      <defs>
        <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="var(--ink)" stop-opacity="0.08" />
          <stop offset="100%" stop-color="var(--ink)" stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>
  `,
  styles: `
    @keyframes pulse-scale {
      0%,
      100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }
    .animate-pulse-scale {
      animation: pulse-scale 10s ease-in-out infinite;
    }
  `,
})
export class PrismaIcon {
  readonly size = input<number>(48);
}
