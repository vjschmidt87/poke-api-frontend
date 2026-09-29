import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, map, startWith, catchError } from 'rxjs/operators';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { PokemonSpecies } from './pokemon.model';

@Component({
  selector: 'app-species-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a routerLink="/pokemon" class="back-link">&larr; Back to Pokemon</a>

    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load species.</div>
      } @else {
        <div class="detail-header">
          <h1>
            {{ vm.data.name | pokeName }}
          </h1>
        </div>

        @if (getGenus(vm.data)) {
          <p class="genus">{{ getGenus(vm.data) }}</p>
        }

        @if (getFlavorText(vm.data)) {
          <div class="detail-section">
            <h3>Pokedex Entry</h3>
            <p>{{ getFlavorText(vm.data) }}</p>
          </div>
        }

        <div class="detail-section">
          <h3>Info</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Color</div>
              <div class="info-value">
                <a [routerLink]="['/pokemon/color', vm.data.color.name]">
                  {{ vm.data.color.name | pokeName }}
                </a>
              </div>
            </div>
            @if (vm.data.shape) {
              <div class="info-item">
                <div class="info-label">Shape</div>
                <div class="info-value">
                  <a [routerLink]="['/pokemon/shape', vm.data.shape.name]">
                    {{ vm.data.shape.name | pokeName }}
                  </a>
                </div>
              </div>
            }
            @if (vm.data.habitat) {
              <div class="info-item">
                <div class="info-label">Habitat</div>
                <div class="info-value">
                  <a [routerLink]="['/pokemon/habitat', vm.data.habitat.name]">
                    {{ vm.data.habitat.name | pokeName }}
                  </a>
                </div>
              </div>
            }
            <div class="info-item">
              <div class="info-label">Growth Rate</div>
              <div class="info-value">
                <a [routerLink]="['/pokemon/growth-rate', vm.data.growth_rate.name]">
                  {{ vm.data.growth_rate.name | pokeName }}
                </a>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Capture Rate</div>
              <div class="info-value">{{ vm.data.capture_rate }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Base Happiness</div>
              <div class="info-value">{{ vm.data.base_happiness }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Gender Rate</div>
              <div class="info-value">{{ getGenderDisplay(vm.data.gender_rate) }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Hatch Counter</div>
              <div class="info-value">{{ vm.data.hatch_counter }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Generation</div>
              <div class="info-value">{{ vm.data.generation.name | pokeName }}</div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Attributes</h3>
          <ul class="link-list">
            @if (vm.data.is_baby) {
              <li>Baby</li>
            }
            @if (vm.data.is_legendary) {
              <li>Legendary</li>
            }
            @if (vm.data.is_mythical) {
              <li>Mythical</li>
            }
            @if (!vm.data.is_baby && !vm.data.is_legendary && !vm.data.is_mythical) {
              <li>Regular</li>
            }
          </ul>
        </div>

        @if (vm.data.egg_groups.length > 0) {
          <div class="detail-section">
            <h3>Egg Groups</h3>
            <ul class="link-list">
              @for (group of vm.data.egg_groups; track group.name) {
                <li><a [routerLink]="['/pokemon/egg-group', group.name]">{{ group.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        }

        @if (vm.data.evolution_chain?.url) {
          <div class="detail-section">
            <h3>Evolution Chain</h3>
            <a
              [routerLink]="['/evolution/evolution-chain', getEvolutionChainId(vm.data)]"
              class="detail-link"
            >
              View Evolution Chain #{{ getEvolutionChainId(vm.data) }}
            </a>
          </div>
        }

        @if (vm.data.varieties.length > 0) {
          <div class="detail-section">
            <h3>Varieties</h3>
            <ul class="link-list">
              @for (variety of vm.data.varieties; track variety.pokemon.name) {
                <li><a [routerLink]="['/pokemon/pokemon', variety.pokemon.name]">
                  {{ variety.pokemon.name | pokeName }}@if (variety.is_default) {
                    &nbsp;(Default)
                  }
                </a></li>
              }
            </ul>
          </div>
        }
      }
    }
  `,
  styles: [`
    .genus {
      color: var(--color-text-muted);
      font-size: 1rem;
      margin-bottom: 1rem;
      font-style: italic;
    }

    .info-value a {
      color: var(--color-primary);
      &:hover { text-decoration: underline; }
    }
  `],
})
export class SpeciesDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<PokemonSpecies>('pokemon-species', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as PokemonSpecies | null, loading: false })),
      ),
    ),
    startWith({ data: null as PokemonSpecies | null, loading: true }),
  );

  getFlavorText(species: PokemonSpecies): string {
    const entry = species.flavor_text_entries.find(e => e.language.name === 'en');
    return entry?.flavor_text.replace(/[\n\f]/g, ' ') || '';
  }

  getGenus(species: PokemonSpecies): string {
    const entry = species.genera.find(g => g.language.name === 'en');
    return entry?.genus || '';
  }

  getGenderDisplay(rate: number): string {
    if (rate === -1) return 'Genderless';
    if (rate === 0) return '100% Male';
    if (rate === 8) return '100% Female';
    const femalePercent = (rate / 8) * 100;
    return `${100 - femalePercent}% Male, ${femalePercent}% Female`;
  }

  getEvolutionChainId(species: PokemonSpecies): string {
    const parts = species.evolution_chain.url.replace(/\/$/, '').split('/');
    return parts[parts.length - 1];
  }
}
