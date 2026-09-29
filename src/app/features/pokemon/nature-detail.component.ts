import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, map, startWith, catchError } from 'rxjs/operators';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { Nature } from './pokemon.model';

@Component({
  selector: 'app-nature-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a routerLink="/pokemon" class="back-link">&larr; Back to Pokemon</a>

    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load nature.</div>
      } @else {
        <div class="detail-header">
          <h1>
            {{ vm.data.name | pokeName }}
          </h1>
        </div>

        <div class="detail-section">
          <h3>Stat Changes</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Increased Stat</div>
              <div class="info-value">
                @if (vm.data.increased_stat) {
                  <a [routerLink]="['/pokemon/stat', vm.data.increased_stat.name]">
                    {{ vm.data.increased_stat.name | pokeName }}
                  </a>
                } @else {
                  None
                }
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Decreased Stat</div>
              <div class="info-value">
                @if (vm.data.decreased_stat) {
                  <a [routerLink]="['/pokemon/stat', vm.data.decreased_stat.name]">
                    {{ vm.data.decreased_stat.name | pokeName }}
                  </a>
                } @else {
                  None
                }
              </div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Flavor Preferences</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Likes Flavor</div>
              <div class="info-value">
                @if (vm.data.likes_flavor) {
                  {{ vm.data.likes_flavor.name | pokeName }}
                } @else {
                  None
                }
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Hates Flavor</div>
              <div class="info-value">
                @if (vm.data.hates_flavor) {
                  {{ vm.data.hates_flavor.name | pokeName }}
                } @else {
                  None
                }
              </div>
            </div>
          </div>
        </div>

        @if (vm.data.pokeathlon_stat_changes.length > 0) {
          <div class="detail-section">
            <h3>Pokeathlon Stat Changes</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Stat</th>
                  <th>Max Change</th>
                </tr>
              </thead>
              <tbody>
                @for (change of vm.data.pokeathlon_stat_changes; track change.pokeathlon_stat.name) {
                  <tr>
                    <td>{{ change.pokeathlon_stat.name | pokeName }}</td>
                    <td>{{ change.max_change > 0 ? '+' : '' }}{{ change.max_change }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (vm.data.move_battle_style_preferences.length > 0) {
          <div class="detail-section">
            <h3>Move Battle Style Preferences</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Battle Style</th>
                  <th>Low HP</th>
                  <th>High HP</th>
                </tr>
              </thead>
              <tbody>
                @for (pref of vm.data.move_battle_style_preferences; track pref.move_battle_style.name) {
                  <tr>
                    <td>{{ pref.move_battle_style.name | pokeName }}</td>
                    <td>{{ pref.low_hp_preference }}%</td>
                    <td>{{ pref.high_hp_preference }}%</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    }
  `,
  styles: [`
    .info-value a {
      color: var(--color-primary);
      &:hover { text-decoration: underline; }
    }
  `],
})
export class NatureDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<Nature>('nature', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as Nature | null, loading: false })),
      ),
    ),
    startWith({ data: null as Nature | null, loading: true }),
  );
}
