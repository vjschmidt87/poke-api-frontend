import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, map, startWith, catchError } from 'rxjs/operators';

import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { Region } from './locations.model';

@Component({
  selector: 'app-region-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load region.</div>
      } @else {
        <a routerLink="/locations" class="back-link">&larr; Back to Locations</a>

        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        <div class="detail-section">
          <h3>Info</h3>
          <div class="info-grid">
            @if (vm.data.main_generation) {
              <div class="info-item">
                <div class="info-label">Main Generation</div>
                <div class="info-value">
                  <a class="detail-link" [routerLink]="'/games/generation/' + vm.data.main_generation.name">
                    {{ vm.data.main_generation.name | pokeName }}
                  </a>
                </div>
              </div>
            }
          </div>
        </div>

        @if (vm.data.pokedexes.length > 0) {
          <div class="detail-section">
            <h3>Pokedexes ({{ vm.data.pokedexes.length }})</h3>
            <ul class="link-list">
              @for (pokedex of vm.data.pokedexes; track pokedex.name) {
                <li><a [routerLink]="'/games/pokedex/' + pokedex.name">{{ pokedex.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        }

        @if (vm.data.version_groups.length > 0) {
          <div class="detail-section">
            <h3>Version Groups ({{ vm.data.version_groups.length }})</h3>
            <ul class="link-list">
              @for (vg of vm.data.version_groups; track vg.name) {
                <li><a [routerLink]="'/games/version-group/' + vg.name">{{ vg.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        }

        @if (vm.data.locations.length > 0) {
          <div class="detail-section">
            <h3>Locations ({{ vm.data.locations.length }})</h3>
            <ul class="link-list">
              @for (location of vm.data.locations; track location.name) {
                <li><a [routerLink]="'/locations/location/' + location.name">{{ location.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        }
      }
    }
  `,
})
export class RegionDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<Region>('region', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as Region | null, loading: false })),
      ),
    ),
    startWith({ data: null as Region | null, loading: true }),
  );
}
