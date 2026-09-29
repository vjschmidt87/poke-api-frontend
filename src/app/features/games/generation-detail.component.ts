import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { of, switchMap, map, startWith, catchError } from 'rxjs';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { Generation } from './games.model';

@Component({
  selector: 'app-generation-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load generation.</div>
      } @else {
        <a routerLink="/games" class="back-link">&larr; Back to Games</a>

        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        <div class="detail-section">
          <h3>Info</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Main Region</div>
              <div class="info-value">
                <a routerLink="/locations/region/{{ vm.data.main_region.name }}" class="detail-link">
                  {{ vm.data.main_region.name | pokeName }}
                </a>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Abilities Introduced</div>
              <div class="info-value">{{ vm.data.abilities.length }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Moves Introduced</div>
              <div class="info-value">{{ vm.data.moves.length }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Species Introduced</div>
              <div class="info-value">{{ vm.data.pokemon_species.length }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Types Introduced</div>
              <div class="info-value">{{ vm.data.types.length }}</div>
            </div>
          </div>
        </div>

        @if (vm.data.version_groups.length > 0) {
          <div class="detail-section">
            <h3>Version Groups</h3>
            <ul class="link-list">
              @for (vg of vm.data.version_groups; track vg.name) {
                <li><a routerLink="/games/version-group/{{ vg.name }}">{{ vg.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        }

        @if (vm.data.types.length > 0) {
          <div class="detail-section">
            <h3>Types Introduced</h3>
            <ul class="link-list">
              @for (type of vm.data.types; track type.name) {
                <li><a routerLink="/pokemon/type/{{ type.name }}">{{ type.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        }

        @if (vm.data.abilities.length > 0) {
          <div class="detail-section">
            <h3>Abilities Introduced</h3>
            <ul class="link-list">
              @for (ability of vm.data.abilities; track ability.name) {
                <li><a routerLink="/pokemon/ability/{{ ability.name }}">{{ ability.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        }

        @if (vm.data.moves.length > 0) {
          <div class="detail-section">
            <h3>Moves Introduced</h3>
            <ul class="link-list">
              @for (move of vm.data.moves; track move.name) {
                <li><a routerLink="/moves/move/{{ move.name }}">{{ move.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        }

        @if (vm.data.pokemon_species.length > 0) {
          <div class="detail-section">
            <h3>Pokemon Species Introduced</h3>
            <ul class="link-list">
              @for (species of vm.data.pokemon_species; track species.name) {
                <li><a routerLink="/pokemon/species/{{ species.name }}">{{ species.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        }
      }
    }
  `,
})
export class GenerationDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<Generation>('generation', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as Generation | null, loading: false })),
      ),
    ),
    startWith({ data: null as Generation | null, loading: true }),
  );
}
