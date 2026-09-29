import { Component, ChangeDetectionStrategy, DestroyRef, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-bar">
      <input
        type="text"
        [ngModel]="searchText"
        (ngModelChange)="onSearchChange($event)"
        placeholder="Search by name or ID..."
        class="search-input"
      />
    </div>
  `,
  styles: [`
    @use 'variables' as *;

    .search-bar { margin-bottom: 1rem; }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid $color-border;
      border-radius: $radius-md;
      font-size: $font-size-md;
      background: $color-input-bg;
      color: $color-text;
      transition: border-color 0.2s;
      box-sizing: border-box;

      &:focus {
        outline: none;
        border-color: $color-primary;
      }

      &::placeholder { color: $color-text-light; }
    }
  `],
})
export class SearchBarComponent {
  searchText = '';
  searchChange = output<string>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(value => this.searchChange.emit(value));
  }

  onSearchChange(value: string) {
    this.searchText = value;
    this.searchSubject.next(value);
  }
}
