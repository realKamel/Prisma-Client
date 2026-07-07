import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// ── Models ───────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Teacher' | 'Student' | 'Assistant';
  active: boolean;
  joined: string;      // e.g. "2024-01-15"
  lastActive: string;  // e.g. "منذ 5 دقائق"
}

// ── Component ──────────────────────────────────────────────────────────────
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './users.html',
})
export class UsersComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  users: User[] = [];
  loading = true;

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
    // Simulate API loading
    setTimeout(() => {
      this.users = this.getDummyData();
      this.loading = false;
      this.cdr.detectChanges();
    }, 800);
  }

  // ── Dummy Data ─────────────────────────────────────────────────────────────
  private getDummyData(): User[] {
    return [
      { id: 1,  name: 'أحمد محمد علي',       email: 'ahmed.m@school.edu',    role: 'Admin',      active: true,  joined: '2024-01-15', lastActive: 'منذ 5 دقائق' },
      { id: 2,  name: 'سارة خالد عبدالله',   email: 'sara.k@school.edu',     role: 'Teacher',    active: true,  joined: '2024-02-10', lastActive: 'منذ ساعة' },
      { id: 3,  name: 'محمد إبراهيم حسن',    email: 'mohamed.i@school.edu',  role: 'Student',    active: true,  joined: '2024-03-05', lastActive: 'منذ يومين' },
      { id: 4,  name: 'فاطمة أحمد محمود',    email: 'fatima.a@school.edu',   role: 'Assistant',  active: false, joined: '2024-03-20', lastActive: 'منذ أسبوع' },
      { id: 5,  name: 'عمر سعيد عبدالرحمن',  email: 'omar.s@school.edu',     role: 'Admin',      active: true,  joined: '2024-01-20', lastActive: 'منذ 10 دقائق' },
      { id: 6,  name: 'ليلى محمود كمال',     email: 'laila.m@school.edu',    role: 'Teacher',    active: true,  joined: '2024-04-01', lastActive: 'منذ 3 ساعات' },
      { id: 7,  name: 'يوسف علي أحمد',       email: 'yousef.a@school.edu',   role: 'Student',    active: false, joined: '2024-04-15', lastActive: 'منذ شهر' },
      { id: 8,  name: 'نورا خالد سامي',      email: 'noura.k@school.edu',    role: 'Assistant',  active: true,  joined: '2024-05-01', lastActive: 'منذ يوم' },
      { id: 9,  name: 'خالد عبدالله فؤاد',   email: 'khaled.a@school.edu',   role: 'Teacher',    active: true,  joined: '2024-02-25', lastActive: 'منذ 20 دقيقة' },
      { id: 10, name: 'هدى محمد سعيد',       email: 'hoda.m@school.edu',     role: 'Student',    active: true,  joined: '2024-05-10', lastActive: 'منذ ساعتين' },
      { id: 11, name: 'رامي طارق حسن',       email: 'ramy.t@school.edu',     role: 'Admin',      active: false, joined: '2024-01-05', lastActive: 'منذ شهرين' },
      { id: 12, name: 'منى إبراهيم علي',     email: 'mona.i@school.edu',     role: 'Teacher',    active: true,  joined: '2024-06-01', lastActive: 'منذ 15 دقيقة' },
      { id: 13, name: 'سامي خالد محمود',     email: 'sami.k@school.edu',     role: 'Student',    active: true,  joined: '2024-06-15', lastActive: 'منذ 4 ساعات' },
      { id: 14, name: 'دينا أحمد فؤاد',      email: 'dina.a@school.edu',     role: 'Assistant',  active: true,  joined: '2024-07-01', lastActive: 'منذ 30 دقيقة' },
      { id: 15, name: 'طارق سعيد عبدالله',   email: 'tarek.s@school.edu',    role: 'Admin',      active: true,  joined: '2024-01-30', lastActive: 'منذ دقيقة' },
      { id: 16, name: 'رانيا محمد كمال',     email: 'rania.m@school.edu',    role: 'Teacher',    active: false, joined: '2024-07-15', lastActive: 'منذ أسبوعين' },
      { id: 17, name: 'علي إبراهيم سامي',    email: 'ali.i@school.edu',      role: 'Student',    active: true,  joined: '2024-08-01', lastActive: 'منذ 6 ساعات' },
      { id: 18, name: 'مريم خالد عبدالرحمن', email: 'mariam.k@school.edu',   role: 'Assistant',  active: true,  joined: '2024-08-10', lastActive: 'منذ ساعة' },
      { id: 19, name: 'حسن علي محمود',       email: 'hassan.a@school.edu',   role: 'Teacher',    active: true,  joined: '2024-03-10', lastActive: 'منذ 8 دقائق' },
      { id: 20, name: 'أمل سعيد فؤاد',       email: 'amal.s@school.edu',     role: 'Student',    active: false, joined: '2024-09-01', lastActive: 'منذ 3 أيام' },
      { id: 21, name: 'وليد محمد عبدالله',   email: 'walid.m@school.edu',    role: 'Admin',      active: true,  joined: '2024-02-01', lastActive: 'منذ 25 دقيقة' },
      { id: 22, name: 'نهى إبراهيم كمال',    email: 'noha.i@school.edu',     role: 'Teacher',    active: true,  joined: '2024-09-15', lastActive: 'منذ ساعتين' },
      { id: 23, name: 'كريم أحمد سامي',      email: 'karim.a@school.edu',    role: 'Student',    active: true,  joined: '2024-10-01', lastActive: 'منذ 12 دقيقة' },
      { id: 24, name: 'شيماء خالد محمود',    email: 'shaimaa.k@school.edu',  role: 'Assistant',  active: false, joined: '2024-10-10', lastActive: 'منذ 5 أيام' },
    ];
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

deleteUser(id: number) {
  // Confirm before deleting
  if (!confirm('هل أنت متأكد أنك تريد حذف هذا المستخدم؟')) {
    return;
  }

  // Remove from local array (for dummy data)
  this.users = this.users.filter(u => u.id !== id);

  // TODO: Replace with actual API call:
  // this.userService.deleteUser(id).subscribe({
  //   next: () => {
  //     this.users = this.users.filter(u => u.id !== id);
  //   },
  //   error: (err) => console.error('Failed to delete user', err)
  // });

  // Reset to page 1 if current page becomes empty
  if (this.paginated.length === 0 && this.currentPage > 1) {
    this.currentPage--;
  }
}
}