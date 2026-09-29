import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable, switchMap, startWith, Subject, map } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { NamedAPIResourceList } from '../../core/models/common.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';


type Tab = 'berries' | 'firmnesses' | 'flavors';

interface TabConfig {
  key: Tab;
  label: string;
  endpoint: string;
  routePrefix: string;
}

@Component({
  selector: 'app-berries-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    RouterLink,
    LoadingComponent,
    PaginationComponent,
    SearchBarComponent,
    PokeNamePipe,
  ],
  template: `
    <div class="page-header">
      <h1>Berries</h1>
      <p>Berry details, firmness categories, and flavor types</p>
    </div>

    <div class="tabs">
      @for (t of tabs; track t.key) {
        <button
          class="tab"
          [class.active]="activeTab() === t.key"
          (click)="setTab(t.key)"
        >
          {{ t.label }}
        </button>
      }
    </div>

    <app-search-bar (searchChange)="onSearch($event)" />

    @if (filteredList$ | async; as data) {
      @if (data.results.length) {
        <div class="resource-grid">
          @for (item of pagedResults(data); track item.name) {
            <a
              class="resource-card"
              [routerLink]="currentTabConfig().routePrefix + '/' + item.name"
            >
              <span class="resource-name">{{ item.name | pokeName }}</span>
            </a>
          }
        </div>
        <app-pagination
          [totalCount]="data.results.length"
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
export class BerriesPageComponent {
  private readonly api = inject(PokeApiService);

  readonly tabs: TabConfig[] = [
    { key: 'berries', label: 'Berries', endpoint: 'berry', routePrefix: 'berry' },
    { key: 'firmnesses', label: 'Firmnesses', endpoint: 'berry-firmness', routePrefix: 'firmness' },
    { key: 'flavors', label: 'Flavors', endpoint: 'berry-flavor', routePrefix: 'flavor' },
  ];

  activeTab = signal<Tab>('berries');
  currentPage = signal(1);
  pageSize = 20;

  private tab$ = new Subject<Tab>();
  private search$ = new Subject<string>();
  private allLists = new Map<Tab, Observable<NamedAPIResourceList>>();

  currentTabConfig = computed(() => this.tabs.find(t => t.key === this.activeTab())!);

  filteredList$ = this.tab$.pipe(
    startWith('berries' as Tab),
    switchMap(tab => this.getList(tab)),
    switchMap(list =>
      this.search$.pipe(
        startWith(''),
        map(term => this.filterList(list, term)),
      ),
    ),
  );

  setTab(tab: Tab) {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.tab$.next(tab);
  }

  onSearch(term: string) {
    this.currentPage.set(1);
    this.search$.next(term);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  pagedResults(data: NamedAPIResourceList) {
    const start = (this.currentPage() - 1) * this.pageSize;
    return data.results.slice(start, start + this.pageSize);
  }

  private getList(tab: Tab): Observable<NamedAPIResourceList> {
    const config = this.tabs.find(t => t.key === tab)!;
    if (!this.allLists.has(tab)) {
      this.allLists.set(tab, this.api.getAllResources(config.endpoint));
    }
    return this.allLists.get(tab)!;
  }

  private filterList(data: NamedAPIResourceList, term: string): NamedAPIResourceList {
    if (!term) return data;
    const lower = term.toLowerCase();
    return {
      ...data,
      results: data.results.filter(
        r => r.name.includes(lower) || this.api.getIdFromUrl(r.url) === lower,
      ),
    };
  }
}
