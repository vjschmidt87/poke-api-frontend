import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of, switchMap, map, startWith, catchError } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { BerryFirmness } from './berries.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';

@Component({
  selector: 'app-firmness-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load firmness.</div>
      } @else {
        <a routerLink="/berries" class="back-link">&larr; Back to Berries</a>

        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        <div class="detail-section">
          <h3>Berries with this Firmness</h3>
          @if (vm.data.berries.length) {
            <ul class="link-list">
              @for (berry of vm.data.berries; track berry.name) {
                <li><a [routerLink]="'/berries/berry/' + berry.name">{{ berry.name | pokeName }}</a></li>
              }
            </ul>
          } @else {
            <div class="empty-state">No berries found for this firmness.</div>
          }
        </div>
      }
    }
  `,
})
export class FirmnessDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<BerryFirmness>('berry-firmness', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as BerryFirmness | null, loading: false })),
      ),
    ),
    startWith({ data: null as BerryFirmness | null, loading: true }),
  );
}
