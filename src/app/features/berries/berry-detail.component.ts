import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, map, startWith, catchError } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { Berry } from './berries.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';

@Component({
  selector: 'app-berry-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a routerLink="/berries" class="back-link">&larr; Back to Berries</a>

    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load berry.</div>
      } @else {
        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        <div class="detail-section">
          <h3>Berry Info</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Growth Time</div>
              <div class="info-value">{{ vm.data.growth_time }} hrs</div>
            </div>
            <div class="info-item">
              <div class="info-label">Max Harvest</div>
              <div class="info-value">{{ vm.data.max_harvest }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Size</div>
              <div class="info-value">{{ vm.data.size }} mm</div>
            </div>
            <div class="info-item">
              <div class="info-label">Smoothness</div>
              <div class="info-value">{{ vm.data.smoothness }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Soil Dryness</div>
              <div class="info-value">{{ vm.data.soil_dryness }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Natural Gift Power</div>
              <div class="info-value">{{ vm.data.natural_gift_power }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Natural Gift Type</div>
              <div class="info-value">
                <a [routerLink]="'/pokemon/type/' + vm.data.natural_gift_type.name" class="detail-link">
                  {{ vm.data.natural_gift_type.name | pokeName }}
                </a>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Firmness</div>
              <div class="info-value">
                <a [routerLink]="'/berries/firmness/' + vm.data.firmness.name" class="detail-link">
                  {{ vm.data.firmness.name | pokeName }}
                </a>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Item</div>
              <div class="info-value">
                <a [routerLink]="'/items/item/' + vm.data.item.name" class="detail-link">
                  {{ vm.data.item.name | pokeName }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Flavors</h3>
          @if (vm.data.flavors.length) {
            <table class="data-table">
              <thead>
                <tr>
                  <th>Flavor</th>
                  <th>Potency</th>
                </tr>
              </thead>
              <tbody>
                @for (entry of vm.data.flavors; track entry.flavor.name) {
                  <tr>
                    <td>
                      <a [routerLink]="'/berries/flavor/' + entry.flavor.name">
                        {{ entry.flavor.name | pokeName }}
                      </a>
                    </td>
                    <td>{{ entry.potency }}</td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <div class="empty-state">No flavor data available.</div>
          }
        </div>
      }
    }
  `,
})
export class BerryDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<Berry>('berry', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as Berry | null, loading: false })),
      ),
    ),
    startWith({ data: null as Berry | null, loading: true }),
  );
}
