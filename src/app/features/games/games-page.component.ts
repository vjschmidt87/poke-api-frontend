import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Observable, of, switchMap, startWith, catchError } from 'rxjs';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { NamedAPIResourceList, NamedAPIResource } from '../../core/models/common.model';
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

@Component({
  selector: 'app-games-page',
  standalone: true,
  imports: [
    RouterLink,
    AsyncPipe,
    LoadingComponent,
    PaginationComponent,
    SearchBarComponent,
    PokeNamePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <h1>Games</h1>
      <p>Generations, versions, version groups, and regional Pokedexes</p>
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

    @if (resourceList$ | async; as list) {
      @if (filteredResults(list.results).length > 0) {
        <div class="resource-grid">
          @for (item of paginatedResults(filteredResults(list.results)); track item.name) {
            <a
              class="resource-card"
              [routerLink]="currentTab().routePrefix + '/' + item.name"
            >
              <span class="resource-name">{{ item.name | pokeName }}</span>
            </a>
          }
        </div>
        <app-pagination
          [totalCount]="filteredResults(list.results).length"
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
export class GamesPageComponent {
  private readonly api = inject(PokeApiService);

  tabs: Tab[] = [
    { key: 'generation', label: 'Generations', endpoint: 'generation', routePrefix: 'generation' },
    { key: 'pokedex', label: 'Pokedexes', endpoint: 'pokedex', routePrefix: 'pokedex' },
    { key: 'version', label: 'Versions', endpoint: 'version', routePrefix: 'version' },
    { key: 'version-group', label: 'Version Groups', endpoint: 'version-group', routePrefix: 'version-group' },
  ];

  activeTab = signal('generation');
  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = 20;

  currentTab = computed(() => this.tabs.find(t => t.key === this.activeTab())!);

  resourceList$: Observable<NamedAPIResourceList> = this.api.getAllResources(this.currentTab().endpoint);

  selectTab(key: string) {
    this.activeTab.set(key);
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadTab();
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  filteredResults(results: NamedAPIResource[]): NamedAPIResource[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return results;
    return results.filter(r =>
      r.name.includes(term) || this.api.getIdFromUrl(r.url).includes(term)
    );
  }

  paginatedResults(results: NamedAPIResource[]): NamedAPIResource[] {
    const start = (this.currentPage() - 1) * this.pageSize;
    return results.slice(start, start + this.pageSize);
  }

  private loadTab() {
    this.resourceList$ = this.api.getAllResources(this.currentTab().endpoint);
  }
}
