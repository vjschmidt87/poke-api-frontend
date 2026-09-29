import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of, switchMap, map, startWith, catchError } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { BerryFlavor } from './berries.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';

@Component({
  selector: 'app-flavor-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load flavor.</div>
      } @else {
        <a routerLink="/berries" class="back-link">&larr; Back to Berries</a>

        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        <div class="detail-section">
          <h3>Contest Type</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Contest Type</div>
              <div class="info-value">
                <a
                  [routerLink]="'/contests/type/' + vm.data.contest_type.name"
                  class="detail-link"
                >
                  {{ vm.data.contest_type.name | pokeName }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Berries with this Flavor</h3>
          @if (vm.data.berries.length) {
            <table class="data-table">
              <thead>
                <tr>
                  <th>Berry</th>
                  <th>Potency</th>
                </tr>
              </thead>
              <tbody>
                @for (entry of vm.data.berries; track entry.berry.name) {
                  <tr>
                    <td>
                      <a [routerLink]="'/berries/berry/' + entry.berry.name">
                        {{ entry.berry.name | pokeName }}
                      </a>
                    </td>
                    <td>{{ entry.potency }}</td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <div class="empty-state">No berries found for this flavor.</div>
          }
        </div>
      }
    }
  `,
})
export class FlavorDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<BerryFlavor>('berry-flavor', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as BerryFlavor | null, loading: false })),
      ),
    ),
    startWith({ data: null as BerryFlavor | null, loading: true }),
  );
}
