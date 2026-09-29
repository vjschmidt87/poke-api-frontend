import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, map, catchError, startWith } from 'rxjs/operators';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { APIResource } from '../../core/models/common.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ExtractIdPipe } from '../../shared/pipes/extract-id.pipe';

interface PageData {
  results: APIResource[];
  totalCount: number;
  loading: boolean;
}

@Component({
  selector: 'app-machines-page',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    LoadingComponent,
    PaginationComponent,
    ExtractIdPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <h1>Machines</h1>
      <p>TMs and HMs that teach moves to Pokemon</p>
    </div>

    @if (pageData$ | async; as data) {
      @if (data.loading) {
        <app-loading />
      } @else {
        @if (data.results.length === 0) {
          <div class="empty-state">No machines found.</div>
        } @else {
          <div class="resource-grid">
            @for (item of data.results; track item.url) {
              <a
                class="resource-card"
                [routerLink]="'machine/' + (item.url | extractId)"
              >
                <span class="resource-name">Machine #{{ item.url | extractId }}</span>
              </a>
            }
          </div>

          <app-pagination
            [totalCount]="data.totalCount"
            [pageSize]="pageSize"
            [currentPage]="currentPage()"
            (pageChange)="onPageChange($event)"
          />
        }
      }
    }
  `,
})
export class MachinesPageComponent {
  private readonly api = inject(PokeApiService);

  pageSize = 20;
  currentPage = signal(1);

  private readonly page$ = new BehaviorSubject<number>(1);

  pageData$: Observable<PageData> = this.page$.pipe(
      switchMap(page => {
        const offset = (page - 1) * this.pageSize;
        return this.api.getUnnamedResourceList('machine', this.pageSize, offset).pipe(
          map(list => ({
            results: list.results,
            totalCount: list.count,
            loading: false,
          } as PageData)),
          startWith({ results: [], totalCount: 0, loading: true } as PageData),
        );
      }),
      catchError(() => of({ results: [], totalCount: 0, loading: false } as PageData)),
    );

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.page$.next(page);
  }
}
