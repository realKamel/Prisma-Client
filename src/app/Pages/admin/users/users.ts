import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { User } from '../../../core/Models/Admin/User.model';
import { UserService } from '../../../core/Services/user.service';
import { AppRole } from '../../../core/enums/role-enum';

@Component({
  selector: 'app-users',
  imports: [FormsModule, RouterModule, DecimalPipe],
  templateUrl: './users.html',
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);

  protected readonly users = signal<User[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  // Filters
  protected readonly searchQuery = signal('');
  protected readonly roleFilter = signal('all');
  protected readonly statusFilter = signal('all');

  // Pagination
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);

  // Role options for the filter dropdown
  readonly roleOptions = [
    { value: AppRole.ADMIN, label: 'مدير ', color: '#8b5cf6' },
    { value: AppRole.TEACHER, label: 'معلم ', color: '#3b82f6' },
    { value: AppRole.STUDENT, label: 'طالب ', color: '#4ecb8d' },
    { value: AppRole.ASSISTANT, label: 'مساعد ', color: '#f59e0b' },
  ];

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.loading.set(true);
    this.error.set('');

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.error.set('تعذر تحميل المستخدمين. حاول مرة أخرى.');
        this.loading.set(false);
      },
    });
  }

  // ── Filtering ──────────────────────────────────────────────────────────────
  protected readonly filtered = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const currentUsers = this.users();
    const role = this.roleFilter();
    const status = this.statusFilter();

    return currentUsers.filter((u) => {
      const matchName = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = role === 'all' || u.role === role;
      const matchStatus = status === 'all' || (status === 'active' ? u.active : !u.active);
      return matchName && matchRole && matchStatus;
    });
  });

  // ── Pagination ─────────────────────────────────────────────────────────────
  protected readonly paginated = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  protected readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filtered().length / this.pageSize()));
  });

  changePage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.currentPage.set(p);
  }

  onFilterChange() {
    this.currentPage.set(1);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
  }

  toAr(n: number): string {
    return String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }

  roleStyle(role: string) {
    const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
      Admin: { bg: 'rgba(139,92,246,0.16)', text: '#8b5cf6', dot: '#8b5cf6', label: 'مدير' },
      Teacher: { bg: 'rgba(59,130,246,0.16)', text: '#3b82f6', dot: '#3b82f6', label: 'معلم' },
      Student: { bg: 'rgba(78,203,141,0.16)', text: '#4ecb8d', dot: '#4ecb8d', label: 'طالب' },
      Assistant: { bg: 'rgba(245,158,11,0.16)', text: '#f59e0b', dot: '#f59e0b', label: 'مساعد' },
    };
    return (
      map[role] || { bg: 'var(--surface2)', text: 'var(--muted)', dot: 'var(--muted)', label: role }
    );
  }

  protected readonly activeCount = computed(() => {
    return this.users().filter((u) => u.active).length;
  });

  // ── Actions ──────────────────────────────────────────────────────────────────
  deleteUser(id: string) {
    if (!confirm('هل أنت متأكد أنك تريد حذف هذا المستخدم؟')) {
      return;
    }

    // Optimistic removal, reverted on failure
    const prevUsers = this.users();
    this.users.set(prevUsers.filter((u) => u.id !== id));

    this.userService.deleteUser(id).subscribe({
      next: () => {
        // Reset to page 1 if current page becomes empty
        if (this.paginated().length === 0 && this.currentPage() > 1) {
          this.currentPage.update((cp) => cp - 1);
        }
      },
      error: (err) => {
        console.error('Failed to delete user', err);
        this.users.set(prevUsers);
        alert('تعذر حذف المستخدم. حاول مرة أخرى.');
      },
    });
  }
}
