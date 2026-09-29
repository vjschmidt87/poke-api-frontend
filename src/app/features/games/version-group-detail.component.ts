import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { of, switchMap, map, startWith, catchError } from 'rxjs';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { VersionGroup } from './games.model';

@Component({
  selector: 'app-version-group-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load version group.</div>
      } @else {
        <a routerLink="/games" class="back-link">&larr; Back to Games</a>

        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        <div class="detail-section">
          <h3>Info</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Generation</div>
              <div class="info-value">
                <a routerLink="/games/generation/{{ vm.data.generation.name }}" class="detail-link">
                  {{ vm.data.generation.name | pokeName }}
                </a>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Order</div>
              <div class="info-value">{{ vm.data.order }}</div>
            </div>
          </div>
        </div>

        @if (vm.data.versions.length > 0) {
          <div class="detail-section">
            <h3>Versions</h3>
            <ul class="link-list">
              @for (version of vm.data.versions; track version.name) {
                <li><a routerLink="/games/version/{{ version.name }}">{{ version.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        }

        @if (vm.data.regions.length > 0) {
          <div class="detail-section">
            <h3>Regions</h3>
            <ul class="link-list">
              @for (region of vm.data.regions; track region.name) {
                <li><a routerLink="/locations/region/{{ region.name }}">{{ region.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        }

        @if (vm.data.pokedexes.length > 0) {
          <div class="detail-section">
            <h3>Pokedexes</h3>
            <ul class="link-list">
              @for (dex of vm.data.pokedexes; track dex.name) {
                <li><a routerLink="/games/pokedex/{{ dex.name }}">{{ dex.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        }

        @if (vm.data.move_learn_methods.length > 0) {
          <div class="detail-section">
            <h3>Move Learn Methods</h3>
            <ul class="link-list">
              @for (method of vm.data.move_learn_methods; track method.name) {
                <li><a routerLink="/moves/learn-method/{{ method.name }}">{{ method.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        }
      }
    }
  `,
})
export class VersionGroupDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<VersionGroup>('version-group', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as VersionGroup | null, loading: false })),
      ),
    ),
    startWith({ data: null as VersionGroup | null, loading: true }),
  );
}
