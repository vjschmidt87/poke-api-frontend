import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, map, startWith, catchError } from 'rxjs/operators';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { Ability } from './pokemon.model';

@Component({
  selector: 'app-ability-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a routerLink="/pokemon" class="back-link">&larr; Back to Pokemon</a>

    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load ability.</div>
      } @else {
        <div class="detail-header">
          <h1>
            {{ vm.data.name | pokeName }}
          </h1>
        </div>

        @if (getEffectText(vm.data)) {
          <div class="detail-section">
            <h3>Effect</h3>
            <p>{{ getEffectText(vm.data) }}</p>
          </div>
        }

        @if (getShortEffect(vm.data)) {
          <div class="detail-section">
            <h3>Short Effect</h3>
            <p>{{ getShortEffect(vm.data) }}</p>
          </div>
        }

        @if (getFlavorText(vm.data)) {
          <div class="detail-section">
            <h3>Flavor Text</h3>
            <p>{{ getFlavorText(vm.data) }}</p>
          </div>
        }

        <div class="detail-section">
          <h3>Info</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Generation</div>
              <div class="info-value">{{ vm.data.generation.name | pokeName }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Main Series</div>
              <div class="info-value">{{ vm.data.is_main_series ? 'Yes' : 'No' }}</div>
            </div>
          </div>
        </div>

        @if (vm.data.pokemon.length > 0) {
          <div class="detail-section">
            <h3>Pokemon with this Ability</h3>
            <ul class="link-list">
              @for (entry of vm.data.pokemon; track entry.pokemon.name) {
                <li><a [routerLink]="['/pokemon/pokemon', entry.pokemon.name]">
                  {{ entry.pokemon.name | pokeName }}@if (entry.is_hidden) {
                    &nbsp;(Hidden)
                  }
                </a></li>
              }
            </ul>
          </div>
        }
      }
    }
  `,
})
export class AbilityDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<Ability>('ability', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as Ability | null, loading: false })),
      ),
    ),
    startWith({ data: null as Ability | null, loading: true }),
  );

  getEffectText(ability: Ability): string {
    const entry = ability.effect_entries.find(e => e.language.name === 'en');
    return entry?.effect || '';
  }

  getShortEffect(ability: Ability): string {
    const entry = ability.effect_entries.find(e => e.language.name === 'en');
    return entry?.short_effect || '';
  }

  getFlavorText(ability: Ability): string {
    const entry = ability.flavor_text_entries.find(e => e.language.name === 'en');
    return entry?.flavor_text.replace(/[\n\f]/g, ' ') || '';
  }
}
