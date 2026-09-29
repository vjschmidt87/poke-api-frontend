import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, map, startWith, catchError } from 'rxjs/operators';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { MoveTarget } from './moves.model';

@Component({
  selector: 'app-target-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a routerLink="/moves" class="back-link">&larr; Back to Moves</a>

    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load target.</div>
      } @else {
        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        @if (getDescription(vm.data); as desc) {
          <div class="detail-section">
            <h3>Description</h3>
            <p class="description-text">{{ desc }}</p>
          </div>
        }

        @if (vm.data.moves.length > 0) {
          <div class="detail-section">
            <h3>Moves ({{ vm.data.moves.length }})</h3>
            <ul class="link-list">
              @for (move of vm.data.moves; track move.name) {
                <li><a [routerLink]="'/moves/move/' + move.name">{{ move.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        } @else {
          <div class="empty-state">No moves target this.</div>
        }
      }
    }
  `,
  styles: [`
    @use 'variables' as *;

    .description-text {
      font-size: $font-size-base;
      color: $color-text-secondary;
      line-height: 1.6;
    }
  `],
})
export class TargetDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.paramMap.pipe(
    switchMap(params =>
      this.api.getResource<MoveTarget>('move-target', params.get('name')!).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as MoveTarget | null, loading: false })),
      ),
    ),
    startWith({ data: null as MoveTarget | null, loading: true }),
  );

  getDescription(target: MoveTarget): string | null {
    const entry = target.descriptions.find(d => d.language.name === 'en');
    return entry?.description ?? null;
  }
}
