import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import type { CodeBatch } from '../../../../core/Models/Teacher/teacher-codes.module';
import { CodesService } from '../../../../core/Services/codes.service';

const PAGE_SIZE = 8;

@Component({
  selector: 'app-codes-batch',
  imports: [RouterLink, DecimalPipe, NgmMotionDirective, DatePipe],
  templateUrl: './codes-batch.html',
})
export class CodesBatchComponent implements OnInit {
  private codesService = inject(CodesService);
  private route = inject(ActivatedRoute);

  // ── Data ──
  protected readonly batch = signal<CodeBatch | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal(false);

  // ── Filters ──
  protected readonly searchQuery = signal('');
  protected readonly statusFilter = signal<'all' | 'used' | 'available'>('all');

  // ── Pagination ──
  protected readonly currentPage = signal(1);

  // ── Copy feedback ──
  protected readonly copiedCode = signal<string | null>(null);
  protected readonly copiedAll = signal(false);

  public ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = Number(params['id']);
      if (id) this.loadBatch(id);
    });
  }

  // ── Load batch via service ──
  private loadBatch(id: number) {
    this.loading.set(true);
    this.codesService.getBatch(id).subscribe((res) => {
      this.batch.set(res.data);
      if (res.fromFallback) this.error.set(true);
      this.loading.set(false);
    });
  }

  // ── Derived: filtered codes ──
  protected readonly filteredCodes = computed(() => {
    const b = this.batch();
    if (!b) return [];

    const q = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();

    return b.codes.filter((c) => {
      const matchQ = !q || c.code.toLowerCase().includes(q) || c.usedBy.toLowerCase().includes(q);
      const matchStatus = status === 'all' || c.status === status;
      return matchQ && matchStatus;
    });
  });

  // ── Derived: paginated codes ──
  protected readonly paginatedCodes = computed(() => {
    const filtered = this.filteredCodes();
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  });

  protected readonly totalPages = computed(() => {
    const filtered = this.filteredCodes();
    return Math.ceil(filtered.length / PAGE_SIZE) || 1;
  });

  // ── Stats ──
  protected readonly availableCount = computed(() => {
    const b = this.batch();
    if (!b) return 0;
    return b.totalCodes - b.usedCodes;
  });

  protected readonly usageRate = computed(() => {
    const b = this.batch();
    if (!b || b.totalCodes === 0) return 0;
    return Math.round((b.usedCodes / b.totalCodes) * 100);
  });

  // ── Pagination helpers ──
  protected goToPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.currentPage.set(p);
  }

  // ── Copy ──
  protected async copyCode(code: string) {
    await navigator.clipboard.writeText(code).then(() => {
      this.copiedCode.set(code);
      setTimeout(() => this.copiedCode.set(null), 1800);
    });
  }

  protected async copyAll() {
    const codes = this.filteredCodes()
      .map((c) => c.code)
      .join('\n');
    await navigator.clipboard.writeText(codes).then(() => {
      this.copiedAll.set(true);
      setTimeout(() => this.copiedAll.set(false), 1800);
    });
  }

  protected getInitials(name: string): string {
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
  }
}
