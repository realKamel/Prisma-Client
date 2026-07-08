import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { User } from '../../../core/Models/Admin/User.model';
import { UserService } from '../../../core/Services/user.service';

// ── Component ──────────────────────────────────────────────────────────────
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './users.html',
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  users: User[] = [];
  loading = true;
  error = '';

  // Filters
  searchQuery = '';
  roleFilter = 'all';
  statusFilter = 'all';

  // Pagination
  currentPage = 1;
  readonly pageSize = 10;

  // Role options for the filter dropdown
  readonly roleOptions = [
    { value: 'Admin',     label: 'مدير ',     color: '#8b5cf6' },
    { value: 'Teacher',   label: 'معلم ',   color: '#3b82f6' },
    { value: 'Student',   label: 'طالب ',   color: '#4ecb8d' },
    { value: 'Assistant', label: 'مساعد ', color: '#f59e0b' },
  ];

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.loading = true;
    this.error = '';
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.error = 'تعذر تحميل المستخدمين. حاول مرة أخرى.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Filtering ──────────────────────────────────────────────────────────────
  get filtered(): User[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.users.filter(u => {
      const matchName = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = this.roleFilter === 'all' || u.role === this.roleFilter;
      const matchStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'active' ? u.active : !u.active);
      return matchName && matchRole && matchStatus;
    });
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  get paginated(): User[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  changePage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }

  onFilterChange() {
    this.currentPage = 1;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
  }

  toAr(n: number): string {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }

  roleStyle(role: string) {
    const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
      Admin:     { bg: 'rgba(139,92,246,0.16)', text: '#8b5cf6', dot: '#8b5cf6', label: 'مدير' },
      Teacher:   { bg: 'rgba(59,130,246,0.16)', text: '#3b82f6', dot: '#3b82f6', label: 'معلم' },
      Student:   { bg: 'rgba(78,203,141,0.16)',  text: '#4ecb8d', dot: '#4ecb8d', label: 'طالب' },
      Assistant: { bg: 'rgba(245,158,11,0.16)', text: '#f59e0b', dot: '#f59e0b', label: 'مساعد' },
    };
    return map[role] || { bg: 'var(--surface2)', text: 'var(--muted)', dot: 'var(--muted)', label: role };
  }

  get activeCount(): number {
    return this.users.filter(u => u.active).length;
  }

  // ── Actions ──────────────────────────────────────────────────────────────────
  deleteUser(id: string) {
    if (!confirm('هل أنت متأكد أنك تريد حذف هذا المستخدم؟')) {
      return;
    }

    // Optimistic removal, reverted on failure
    const prevUsers = this.users;
    this.users = this.users.filter(u => u.id !== id);
    this.cdr.detectChanges();

    this.userService.deleteUser(id).subscribe({
      next: () => {
        // Reset to page 1 if current page becomes empty
        if (this.paginated.length === 0 && this.currentPage > 1) {
          this.currentPage--;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Failed to delete user', err);
        this.users = prevUsers;
        alert('تعذر حذف المستخدم. حاول مرة أخرى.');
        this.cdr.detectChanges();
      },
    });
  }
}