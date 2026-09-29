import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, map, startWith, catchError } from 'rxjs/operators';

import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { LocationArea } from './locations.model';

@Component({
  selector: 'app-location-area-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load location area.</div>
      } @else {
        <a routerLink="/locations" class="back-link">&larr; Back to Locations</a>

        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        <div class="detail-section">
          <h3>Info</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Location</div>
              <div class="info-value">
                <a class="detail-link" [routerLink]="'/locations/location/' + vm.data.location.name">
                  {{ vm.data.location.name | pokeName }}
                </a>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Game Index</div>
              <div class="info-value">{{ vm.data.game_index }}</div>
            </div>
          </div>
        </div>

        @if (vm.data.encounter_method_rates.length > 0) {
          <div class="detail-section">
            <h3>Encounter Method Rates</h3>
            @for (emr of vm.data.encounter_method_rates; track emr.encounter_method.name) {
              <div class="detail-section">
                <h4>
                  <a [routerLink]="'/encounters/method/' + emr.encounter_method.name">
                    {{ emr.encounter_method.name | pokeName }}
                  </a>
                </h4>
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Version</th>
                      <th>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (vd of emr.version_details; track vd.version.name) {
                      <tr>
                        <td>{{ vd.version.name | pokeName }}</td>
                        <td>{{ vd.rate }}%</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        }

        @if (vm.data.pokemon_encounters.length > 0) {
          <div class="detail-section">
            <h3>Pokemon Encounters ({{ vm.data.pokemon_encounters.length }})</h3>
            @for (pe of vm.data.pokemon_encounters; track pe.pokemon.name) {
              <div class="detail-section">
                <h4>
                  <a [routerLink]="'/pokemon/pokemon/' + pe.pokemon.name">
                    {{ pe.pokemon.name | pokeName }}
                  </a>
                </h4>
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Version</th>
                      <th>Max Chance</th>
                      <th>Method</th>
                      <th>Level Range</th>
                      <th>Chance</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (vd of pe.version_details; track vd.version.name) {
                      @for (ed of vd.encounter_details; track $index) {
                        <tr>
                          <td>{{ vd.version.name | pokeName }}</td>
                          <td>{{ vd.max_chance }}%</td>
                          <td>
                            <a [routerLink]="'/encounters/method/' + ed.method.name">
                              {{ ed.method.name | pokeName }}
                            </a>
                          </td>
                          <td>{{ ed.min_level }}–{{ ed.max_level }}</td>
                          <td>{{ ed.chance }}%</td>
                        </tr>
                      }
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        }
      }
    }
  `,
})
export class LocationAreaDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<LocationArea>('location-area', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as LocationArea | null, loading: false })),
      ),
    ),
    startWith({ data: null as LocationArea | null, loading: true }),
  );
}
