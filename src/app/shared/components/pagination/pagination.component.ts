import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pagination">
      <button (click)="onPrevious()" [disabled]="currentPage() <= 1" class="page-btn">
        &laquo; Previous
      </button>
      <span class="page-info">
        Page {{ currentPage() }} of {{ totalPages() }}
        <span class="total-count">({{ totalCount() }} total)</span>
      </span>
      <button (click)="onNext()" [disabled]="currentPage() >= totalPages()" class="page-btn">
        Next &raquo;
      </button>
    </div>
  `,
  styles: [`
    @use 'variables' as *;

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 1rem 0;
    }

    .page-btn {
      padding: 0.5rem 1rem;
      border: 1px solid $color-border;
      border-radius: $radius-input;
      background: $color-surface;
      color: $color-text-secondary;
      cursor: pointer;
      font-size: $font-size-base;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        background: $color-primary;
        color: #fff;
        border-color: $color-primary;
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .page-info {
      font-size: $font-size-base;
      color: $color-text-muted;
    }

    .total-count { color: $color-text-light; }
  `],
})
export class PaginationComponent {
  totalCount = input.required<number>();
  pageSize = input<number>(20);
  currentPage = input<number>(1);
  pageChange = output<number>();

  totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize())));

  onPrevious() {
    if (this.currentPage() > 1) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  onNext() {
    if (this.currentPage() < this.totalPages()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }
}
