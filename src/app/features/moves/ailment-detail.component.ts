import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, map, startWith, catchError } from 'rxjs/operators';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { MoveAilment } from './moves.model';

@Component({
  selector: 'app-ailment-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a routerLink="/moves" class="back-link">&larr; Back to Moves</a>

    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load ailment.</div>
      } @else {
        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        @if (vm.data.moves.length > 0) {
          <div class="detail-section">
            <h3>Moves That Cause This Ailment ({{ vm.data.moves.length }})</h3>
            <ul class="link-list">
              @for (move of vm.data.moves; track move.name) {
                <li><a [routerLink]="'/moves/move/' + move.name">{{ move.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        } @else {
          <div class="empty-state">No moves cause this ailment.</div>
        }
      }
    }
  `,
})
export class AilmentDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.paramMap.pipe(
    switchMap(params =>
      this.api.getResource<MoveAilment>('move-ailment', params.get('name')!).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as MoveAilment | null, loading: false })),
      ),
    ),
    startWith({ data: null as MoveAilment | null, loading: true }),
  );
}
