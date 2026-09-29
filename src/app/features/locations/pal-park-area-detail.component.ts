import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, map, startWith, catchError } from 'rxjs/operators';

import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { PalParkArea } from './locations.model';

@Component({
  selector: 'app-pal-park-area-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load pal park area.</div>
      } @else {
        <a routerLink="/locations" class="back-link">&larr; Back to Locations</a>

        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        @if (vm.data.pokemon_encounters.length > 0) {
          <div class="detail-section">
            <h3>Pokemon Encounters ({{ vm.data.pokemon_encounters.length }})</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Species</th>
                  <th>Base Score</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                @for (pe of vm.data.pokemon_encounters; track pe.pokemon_species.name) {
                  <tr>
                    <td>
                      <a [routerLink]="'/pokemon/species/' + pe.pokemon_species.name">
                        {{ pe.pokemon_species.name | pokeName }}
                      </a>
                    </td>
                    <td>{{ pe.base_score }}</td>
                    <td>{{ pe.rate }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="empty-state">No pokemon encounters found.</div>
        }
      }
    }
  `,
})
export class PalParkAreaDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<PalParkArea>('pal-park-area', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as PalParkArea | null, loading: false })),
      ),
    ),
    startWith({ data: null as PalParkArea | null, loading: true }),
  );
}
