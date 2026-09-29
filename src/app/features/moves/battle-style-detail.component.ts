import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, map, startWith, catchError } from 'rxjs/operators';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { MoveBattleStyle } from './moves.model';

@Component({
  selector: 'app-battle-style-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a routerLink="/moves" class="back-link">&larr; Back to Moves</a>

    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load battle style.</div>
      } @else {
        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        @if (getEnglishName(vm.data); as englishName) {
          <div class="detail-section">
            <h3>Localized Name</h3>
            <p class="description-text">{{ englishName }}</p>
          </div>
        }

        @if (vm.data.names.length > 0) {
          <div class="detail-section">
            <h3>Names in Other Languages</h3>
            <ul class="link-list">
              @for (name of vm.data.names; track name.language.name) {
                <li><span>{{ name.name }} ({{ name.language.name }})</span></li>
              }
            </ul>
          </div>
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
export class BattleStyleDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.paramMap.pipe(
    switchMap(params =>
      this.api.getResource<MoveBattleStyle>('move-battle-style', params.get('name')!).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as MoveBattleStyle | null, loading: false })),
      ),
    ),
    startWith({ data: null as MoveBattleStyle | null, loading: true }),
  );

  getEnglishName(bs: MoveBattleStyle): string | null {
    const entry = bs.names.find(n => n.language.name === 'en');
    return entry?.name ?? null;
  }
}
