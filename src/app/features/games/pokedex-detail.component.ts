import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { of, switchMap, map, startWith, catchError, tap } from 'rxjs';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { Pokedex, PokemonEntry } from './games.model';

@Component({
  selector: 'app-pokedex-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PaginationComponent, SearchBarComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load pokedex.</div>
      } @else {
        <a routerLink="/games" class="back-link">&larr; Back to Games</a>

        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        @if (getDescription(vm.data)) {
          <div class="detail-section">
            <h3>Description</h3>
            <p>{{ getDescription(vm.data) }}</p>
          </div>
        }

        <div class="detail-section">
          <h3>Info</h3>
          <div class="info-grid">
            @if (vm.data.region) {
              <div class="info-item">
                <div class="info-label">Region</div>
                <div class="info-value">
                  <a routerLink="/locations/region/{{ vm.data.region.name }}" class="detail-link">
                    {{ vm.data.region.name | pokeName }}
                  </a>
                </div>
              </div>
            }
            <div class="info-item">
              <div class="info-label">Main Series</div>
              <div class="info-value">{{ vm.data.is_main_series ? 'Yes' : 'No' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Total Entries</div>
              <div class="info-value">{{ vm.data.pokemon_entries.length }}</div>
            </div>
          </div>
        </div>

        @if (vm.data.pokemon_entries.length > 0) {
          <div class="detail-section">
            <h3>Pokemon Entries</h3>
            <app-search-bar (searchChange)="onSearch($event, vm.data)" />

            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Pokemon Species</th>
                </tr>
              </thead>
              <tbody>
                @for (entry of paginatedEntries(); track entry.entry_number) {
                  <tr>
                    <td>{{ entry.entry_number }}</td>
                    <td>
                      <a routerLink="/pokemon/species/{{ entry.pokemon_species.name }}">
                        {{ entry.pokemon_species.name | pokeName }}
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>

            @if (filteredEntries().length === 0) {
              <div class="empty-state">No matching entries found.</div>
            }

            @if (filteredEntries().length > 0) {
              <app-pagination
                [totalCount]="filteredEntries().length"
                [pageSize]="pageSize"
                [currentPage]="currentPage()"
                (pageChange)="onPageChange($event)"
              />
            }
          </div>
        }
      }
    }
  `,
})
export class PokedexDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  pageSize = 20;
  currentPage = signal(1);
  searchTerm = signal('');
  allEntries = signal<PokemonEntry[]>([]);

  filteredEntries = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const entries = this.allEntries();
    if (!term) return entries;
    return entries.filter(e =>
      e.pokemon_species.name.includes(term) ||
      e.entry_number.toString().includes(term)
    );
  });

  paginatedEntries = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredEntries().slice(start, start + this.pageSize);
  });

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<Pokedex>('pokedex', params['name']).pipe(
        tap(dex => this.allEntries.set(dex.pokemon_entries)),
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as Pokedex | null, loading: false })),
      ),
    ),
    startWith({ data: null as Pokedex | null, loading: true }),
  );

  getDescription(dex: Pokedex): string {
    const en = dex.descriptions.find(d => d.language.name === 'en');
    return en ? en.description : '';
  }

  onSearch(term: string, dex: Pokedex) {
    this.allEntries.set(dex.pokemon_entries);
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }
}
