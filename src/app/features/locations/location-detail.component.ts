import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, map, startWith, catchError } from 'rxjs/operators';

import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { Location } from './locations.model';

@Component({
  selector: 'app-location-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load location.</div>
      } @else {
        <a routerLink="/locations" class="back-link">&larr; Back to Locations</a>

        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        <div class="detail-section">
          <h3>Info</h3>
          <div class="info-grid">
            @if (vm.data.region) {
              <div class="info-item">
                <div class="info-label">Region</div>
                <div class="info-value">
                  <a class="detail-link" [routerLink]="'/locations/region/' + vm.data.region.name">
                    {{ vm.data.region.name | pokeName }}
                  </a>
                </div>
              </div>
            }
          </div>
        </div>

        @if (vm.data.areas.length > 0) {
          <div class="detail-section">
            <h3>Areas ({{ vm.data.areas.length }})</h3>
            <ul class="link-list">
              @for (area of vm.data.areas; track area.name) {
                <li><a [routerLink]="'/locations/location-area/' + area.name">{{ area.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        }

        @if (vm.data.game_indices.length > 0) {
          <div class="detail-section">
            <h3>Game Indices</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Game Index</th>
                  <th>Generation</th>
                </tr>
              </thead>
              <tbody>
                @for (gi of vm.data.game_indices; track gi.generation.name) {
                  <tr>
                    <td>{{ gi.game_index }}</td>
                    <td>
                      <a [routerLink]="'/games/generation/' + gi.generation.name">
                        {{ gi.generation.name | pokeName }}
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    }
  `,
})
export class LocationDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<Location>('location', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as Location | null, loading: false })),
      ),
    ),
    startWith({ data: null as Location | null, loading: true }),
  );
}
