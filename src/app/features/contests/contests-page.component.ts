import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest, switchMap, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PokeApiService } from '../../core/services/pokeapi.service';
import {
  NamedAPIResource,
  APIResourceList,
} from '../../core/models/common.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';

type Tab = 'types' | 'effects' | 'super-effects';

interface TabConfig {
  key: Tab;
  label: string;
  endpoint: string;
  routePrefix: string;
  named: boolean;
}

interface DisplayItem {
  label: string;
  id: string;
  routerLink: string;
}

interface PageData {
  items: DisplayItem[];
  totalCount: number;
}

@Component({
  selector: 'app-contests-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    RouterLink,
    LoadingComponent,
    PaginationComponent,
    SearchBarComponent,
  ],
  template: `
    <div class="page-header">
      <h1>Contests</h1>
      <p>Contest types, effects, and super contest effects</p>
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

    @if (pageData$ | async; as data) {
      @if (data.items.length > 0) {
        <div class="resource-grid">
          @for (item of data.items; track item.id) {
            <a class="resource-card" [routerLink]="item.routerLink">
              <span class="resource-name">{{ item.label }}</span>
            </a>
          }
        </div>
        <app-pagination
          [totalCount]="data.totalCount"
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
export class ContestsPageComponent {
  private readonly api = inject(PokeApiService);

  readonly tabs: TabConfig[] = [
    { key: 'types', label: 'Contest Types', endpoint: 'contest-type', routePrefix: 'type', named: true },
    { key: 'effects', label: 'Contest Effects', endpoint: 'contest-effect', routePrefix: 'effect', named: false },
    { key: 'super-effects', label: 'Super Contest Effects', endpoint: 'super-contest-effect', routePrefix: 'super-effect', named: false },
  ];

  readonly pageSize = 20;
  activeTab = signal<Tab>('types');
  currentPage = signal(1);

  private tab$ = new BehaviorSubject<Tab>('types');
  private page$ = new BehaviorSubject<number>(1);
  private search$ = new BehaviorSubject<string>('');

  private namedCache = new Map<Tab, NamedAPIResource[]>();
  private unnamedCache = new Map<Tab, { url: string }[]>();

  pageData$ = combineLatest([this.tab$, this.page$, this.search$]).pipe(
    switchMap(([tabKey, page, search]) => {
      const tab = this.tabs.find(t => t.key === tabKey)!;
      const offset = (page - 1) * this.pageSize;

      if (tab.named) {
        return this.getNamedResources(tabKey, tab.endpoint).pipe(
          map(all => {
            const filtered = search
              ? all.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
              : all;
            const paged = filtered.slice(offset, offset + this.pageSize);
            return {
              items: paged.map(r => ({
                label: new PokeNamePipe().transform(r.name),
                id: this.api.getIdFromUrl(r.url),
                routerLink: tab.routePrefix + '/' + r.name,
              })),
              totalCount: filtered.length,
            } as PageData;
          }),
        );
      }

      return this.getUnnamedResources(tabKey, tab.endpoint).pipe(
        map(all => {
          const withIds = all.map(r => ({
            url: r.url,
            id: this.api.getIdFromUrl(r.url),
          }));
          const filtered = search
            ? withIds.filter(r => r.id.includes(search))
            : withIds;
          const paged = filtered.slice(offset, offset + this.pageSize);
          return {
            items: paged.map(r => ({
              label: 'Effect #' + r.id,
              id: r.id,
              routerLink: tab.routePrefix + '/' + r.id,
            })),
            totalCount: filtered.length,
          } as PageData;
        }),
      );
    }),
    catchError(() => of({ items: [], totalCount: 0 } as PageData)),
  );

  selectTab(tab: Tab): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.tab$.next(tab);
    this.page$.next(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.page$.next(page);
  }

  onSearch(term: string): void {
    this.currentPage.set(1);
    this.search$.next(term);
    this.page$.next(1);
  }

  private getNamedResources(tab: Tab, endpoint: string): Observable<NamedAPIResource[]> {
    if (this.namedCache.has(tab)) {
      return of(this.namedCache.get(tab)!);
    }
    return this.api.getAllResources(endpoint).pipe(
      map(res => {
        this.namedCache.set(tab, res.results);
        return res.results;
      }),
    );
  }

  private getUnnamedResources(tab: Tab, endpoint: string): Observable<{ url: string }[]> {
    if (this.unnamedCache.has(tab)) {
      return of(this.unnamedCache.get(tab)!);
    }
    return this.api.getUnnamedResourceList(endpoint, 10000, 0).pipe(
      map((res: APIResourceList) => {
        this.unnamedCache.set(tab, res.results);
        return res.results;
      }),
    );
  }
}
