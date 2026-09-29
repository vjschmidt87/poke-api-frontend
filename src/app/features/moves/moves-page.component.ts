import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { switchMap, map, catchError, startWith } from 'rxjs/operators';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { NamedAPIResource } from '../../core/models/common.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';

interface Tab {
  key: string;
  label: string;
  endpoint: string;
  routePrefix: string;
}

interface TabData {
  results: NamedAPIResource[];
  totalCount: number;
  loading: boolean;
}

@Component({
  selector: 'app-moves-page',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    LoadingComponent,
    PaginationComponent,
    SearchBarComponent,
    PokeNamePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <h1>Moves</h1>
      <p>Battle moves, damage classes, ailments, categories, and more</p>
    </div>

    <div class="tabs">
      @for (tab of tabs; track tab.key) {
        <button
          class="tab"
          [class.active]="activeTabIndex() === $index"
          (click)="selectTab($index)"
        >
          {{ tab.label }}
        </button>
      }
    </div>

    <app-search-bar (searchChange)="onSearch($event)" />

    @if (tabData$ | async; as data) {
      @if (data.loading) {
        <app-loading />
      } @else {
        @if (data.results.length === 0) {
          <div class="empty-state">No results found.</div>
        } @else {
          <div class="resource-grid">
            @for (item of data.results; track item.name) {
              <a
                class="resource-card"
                [routerLink]="tabs[activeTabIndex()].routePrefix + '/' + item.name"
              >
                <span class="resource-name">{{ item.name | pokeName }}</span>
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
export class MovesPageComponent {
  private readonly api = inject(PokeApiService);

  tabs: Tab[] = [
    { key: 'moves', label: 'Moves', endpoint: 'move', routePrefix: 'move' },
    { key: 'ailments', label: 'Ailments', endpoint: 'move-ailment', routePrefix: 'ailment' },
    { key: 'damage-classes', label: 'Damage Classes', endpoint: 'move-damage-class', routePrefix: 'damage-class' },
    { key: 'categories', label: 'Categories', endpoint: 'move-category', routePrefix: 'category' },
    { key: 'learn-methods', label: 'Learn Methods', endpoint: 'move-learn-method', routePrefix: 'learn-method' },
    { key: 'targets', label: 'Targets', endpoint: 'move-target', routePrefix: 'target' },
    { key: 'battle-styles', label: 'Battle Styles', endpoint: 'move-battle-style', routePrefix: 'battle-style' },
  ];

  activeTabIndex = signal(0);
  currentPage = signal(1);
  pageSize = 20;

  private readonly tab$ = new BehaviorSubject<number>(0);
  private readonly page$ = new BehaviorSubject<number>(1);
  private readonly search$ = new BehaviorSubject<string>('');

  tabData$ = combineLatest([this.tab$, this.page$, this.search$]).pipe(
    switchMap(([tabIndex, page, search]) => {
      const tab = this.tabs[tabIndex];

      if (search) {
        return this.api.getAllResources(tab.endpoint).pipe(
          map(list => {
            const filtered = list.results.filter(r =>
              r.name.toLowerCase().includes(search.toLowerCase()),
            );
            return {
              results: filtered.slice((page - 1) * this.pageSize, page * this.pageSize),
              totalCount: filtered.length,
              loading: false,
            } as TabData;
          }),
          startWith({ results: [], totalCount: 0, loading: true } as TabData),
        );
      }

      const offset = (page - 1) * this.pageSize;
      return this.api.getResourceList(tab.endpoint, this.pageSize, offset).pipe(
        map(list => ({
          results: list.results,
          totalCount: list.count,
          loading: false,
        } as TabData)),
        startWith({ results: [], totalCount: 0, loading: true } as TabData),
      );
    }),
    catchError(() => of({ results: [], totalCount: 0, loading: false } as TabData)),
  );

  selectTab(index: number): void {
    this.activeTabIndex.set(index);
    this.currentPage.set(1);
    this.tab$.next(index);
    this.page$.next(1);
  }

  onSearch(term: string): void {
    this.currentPage.set(1);
    this.search$.next(term);
    this.page$.next(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.page$.next(page);
  }
}
