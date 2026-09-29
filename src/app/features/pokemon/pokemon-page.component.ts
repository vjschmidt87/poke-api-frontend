import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { switchMap, map, startWith, catchError, shareReplay } from 'rxjs/operators';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { NamedAPIResource } from '../../core/models/common.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { ExtractIdPipe } from '../../shared/pipes/extract-id.pipe';

interface Tab {
  label: string;
  endpoint: string;
  routePrefix: string;
}

@Component({
  selector: 'app-pokemon-page',
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
      <h1>Pokemon</h1>
      <p>Browse Pokemon, abilities, types, species, and more</p>
    </div>

    <div class="tabs">
      @for (tab of tabs; track tab.endpoint; let i = $index) {
        <button
          class="tab"
          [class.active]="activeTabIndex === i"
          (click)="setTab(i)"
        >
          {{ tab.label }}
        </button>
      }
    </div>

    <app-search-bar (searchChange)="onSearch($event)" />

    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (vm.totalCount > 0) {
        <div class="resource-grid">
          @for (item of vm.items; track item.name) {
            <a
              [routerLink]="['/pokemon', tabs[activeTabIndex].routePrefix, item.name]"
              class="resource-card"
            >
              <span class="dex-entry-number">#{{ item.url | extractId }}</span>
              <span class="resource-name">{{ item.name | pokeName }}</span>
            </a>
          }
        </div>
        <app-pagination
          [totalCount]="vm.totalCount"
          [pageSize]="pageSize"
          [currentPage]="currentPage()"
          (pageChange)="onPageChange($event)"
        />
      } @else {
        <div class="empty-state">No results found.</div>
      }
    }
  `,
})
export class PokemonPageComponent {
  private readonly api = inject(PokeApiService);

  tabs: Tab[] = [
    { label: 'Pokemon', endpoint: 'pokemon', routePrefix: 'pokemon' },
    { label: 'Abilities', endpoint: 'ability', routePrefix: 'ability' },
    { label: 'Types', endpoint: 'type', routePrefix: 'type' },
    { label: 'Species', endpoint: 'pokemon-species', routePrefix: 'species' },
    { label: 'Natures', endpoint: 'nature', routePrefix: 'nature' },
    { label: 'Egg Groups', endpoint: 'egg-group', routePrefix: 'egg-group' },
    { label: 'Stats', endpoint: 'stat', routePrefix: 'stat' },
    { label: 'Growth Rates', endpoint: 'growth-rate', routePrefix: 'growth-rate' },
    { label: 'Colors', endpoint: 'pokemon-color', routePrefix: 'color' },
    { label: 'Shapes', endpoint: 'pokemon-shape', routePrefix: 'shape' },
    { label: 'Habitats', endpoint: 'pokemon-habitat', routePrefix: 'habitat' },
    { label: 'Genders', endpoint: 'gender', routePrefix: 'gender' },
  ];

  activeTabIndex = 0;
  currentPage = signal(1);
  pageSize = 24;

  private activeTab$ = new BehaviorSubject<number>(0);
  private search$ = new BehaviorSubject<string>('');
  private page$ = new BehaviorSubject<number>(1);

  private allResources$ = this.activeTab$.pipe(
    switchMap(tabIndex =>
      this.api.getAllResources(this.tabs[tabIndex].endpoint).pipe(
        map(res => ({ results: res.results, loading: false })),
        startWith({ results: [] as NamedAPIResource[], loading: true }),
        catchError(() => of({ results: [] as NamedAPIResource[], loading: false })),
      ),
    ),
    shareReplay(1),
  );

  vm$ = combineLatest([this.allResources$, this.search$, this.page$]).pipe(
    map(([{ results, loading }, search, page]) => {
      if (loading) {
        return { items: [] as NamedAPIResource[], totalCount: 0, loading: true };
      }
      const filtered = search
        ? results.filter(r => r.name.includes(search.toLowerCase()))
        : results;
      const start = (page - 1) * this.pageSize;
      return {
        items: filtered.slice(start, start + this.pageSize),
        totalCount: filtered.length,
        loading: false,
      };
    }),
  );

  setTab(index: number) {
    this.activeTabIndex = index;
    this.currentPage.set(1);
    this.page$.next(1);
    this.search$.next('');
    this.activeTab$.next(index);
  }

  onSearch(term: string) {
    this.currentPage.set(1);
    this.page$.next(1);
    this.search$.next(term);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.page$.next(page);
  }
}
