import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest, switchMap, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PokeApiService } from '../../core/services/pokeapi.service';
import { NamedAPIResourceList, NamedAPIResource } from '../../core/models/common.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { ExtractIdPipe } from '../../shared/pipes/extract-id.pipe';

type Tab = 'items' | 'attributes' | 'categories' | 'fling-effects' | 'pockets';

interface TabConfig {
  key: Tab;
  label: string;
  endpoint: string;
  routePrefix: string;
}

@Component({
  selector: 'app-items-page',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    LoadingComponent,
    PaginationComponent,
    SearchBarComponent,
    PokeNamePipe,
    ExtractIdPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <h1>Items</h1>
      <p>Items, attributes, categories, fling effects, and bag pockets</p>
    </div>

    <div class="tabs">
      @for (tab of tabs; track tab.key) {
        <button
          class="tab"
          [class.active]="activeTab() === tab.key"
          (click)="selectTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      }
    </div>

    <app-search-bar (searchChange)="onSearch($event)" />

    @if (filteredData$ | async; as data) {
      @if (data.results.length > 0) {
        <div class="resource-grid">
          @for (resource of data.results; track resource.name) {
            <a
              class="resource-card"
              [routerLink]="getActiveTab().routePrefix + '/' + (getActiveTab().key === 'fling-effects' ? (resource.url | extractId) : resource.name)"
            >
              <span class="resource-name">{{ resource.name | pokeName }}</span>
            </a>
          }
        </div>
        <app-pagination
          [totalCount]="data.count"
          [pageSize]="pageSize"
          [currentPage]="currentPage()"
          (pageChange)="onPageChange($event)"
        />
      } @else {
        <div class="empty-state">No results found.</div>
      }
    } @else {
      <app-loading />
    }
  `,
})
export class ItemsPageComponent {
  private readonly api = inject(PokeApiService);

  readonly tabs: TabConfig[] = [
    { key: 'items', label: 'Items', endpoint: 'item', routePrefix: 'item' },
    { key: 'attributes', label: 'Attributes', endpoint: 'item-attribute', routePrefix: 'attribute' },
    { key: 'categories', label: 'Categories', endpoint: 'item-category', routePrefix: 'category' },
    { key: 'fling-effects', label: 'Fling Effects', endpoint: 'item-fling-effect', routePrefix: 'fling-effect' },
    { key: 'pockets', label: 'Pockets', endpoint: 'item-pocket', routePrefix: 'pocket' },
  ];

  readonly pageSize = 20;
  activeTab = signal<Tab>('items');
  currentPage = signal(1);
  searchTerm = signal('');

  private page$ = new BehaviorSubject<number>(1);
  private tab$ = new BehaviorSubject<Tab>('items');
  private search$ = new BehaviorSubject<string>('');

  private allResources = new Map<Tab, NamedAPIResource[]>();

  filteredData$: Observable<NamedAPIResourceList> = combineLatest([this.tab$, this.page$, this.search$]).pipe(
    switchMap(([tab, page, search]) => {
      const config = this.tabs.find(t => t.key === tab)!;

      if (search) {
        return this.getAllForTab(tab, config.endpoint).pipe(
          map(all => {
            const filtered = all.filter(r =>
              r.name.toLowerCase().includes(search.toLowerCase())
            );
            const offset = (page - 1) * this.pageSize;
            return {
              count: filtered.length,
              next: null,
              previous: null,
              results: filtered.slice(offset, offset + this.pageSize),
            } as NamedAPIResourceList;
          }),
        );
      }

      return this.api.getResourceList(config.endpoint, this.pageSize, (page - 1) * this.pageSize).pipe(
        catchError(() => of({ count: 0, next: null, previous: null, results: [] } as NamedAPIResourceList)),
      );
    }),
  );

  private getAllForTab(tab: Tab, endpoint: string): Observable<NamedAPIResource[]> {
    if (this.allResources.has(tab)) {
      return of(this.allResources.get(tab)!);
    }
    return this.api.getAllResources(endpoint).pipe(
      map(res => {
        this.allResources.set(tab, res.results);
        return res.results;
      }),
    );
  }

  selectTab(tab: Tab) {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.tab$.next(tab);
    this.page$.next(1);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.page$.next(page);
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.search$.next(term);
    this.page$.next(1);
  }

  getActiveTab(): TabConfig {
    return this.tabs.find(t => t.key === this.activeTab())!;
  }
}
