import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Generic pager - reused by every paginated list page (Members today; Trainers, Payments, etc. later). */
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  @Input({ required: true }) pageNumber = 0; // zero-based, matches Spring Data Pageable
  @Input({ required: true }) totalPages = 0;
  @Input({ required: true }) totalElements = 0;
  @Input({ required: true }) pageSize = 20;
  @Input() first = true;
  @Input() last = true;

  @Output() pageChange = new EventEmitter<number>();

  get rangeStart(): number {
    const size = this.pageSize > 0 ? this.pageSize : 20;
    return this.totalElements === 0 ? 0 : this.pageNumber * size + 1;
  }

  get rangeEnd(): number {
    const size = this.pageSize > 0 ? this.pageSize : 20;
    return Math.min((this.pageNumber + 1) * size, this.totalElements);
  }

  get visiblePages(): Array<number | null> {
    if (this.totalPages <= 0) return [];
    if (this.totalPages <= 7) {
      return Array.from({ length: this.totalPages }, (_, index) => index);
    }

    const current = Math.max(0, Math.min(this.pageNumber, this.totalPages - 1));
    const pages: Array<number | null> = [0];

    let start = Math.max(1, current - 1);
    let end = Math.min(this.totalPages - 2, current + 1);

    if (current <= 3) {
      start = 1;
      end = 4;
    } else if (current >= this.totalPages - 4) {
      start = this.totalPages - 5;
      end = this.totalPages - 2;
    }

    if (start > 1) pages.push(null);
    for (let page = start; page <= end; page++) pages.push(page);
    if (end < this.totalPages - 2) pages.push(null);

    pages.push(this.totalPages - 1);
    return pages;
  }

  goTo(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.pageNumber) return;
    this.pageChange.emit(page);
  }
}
