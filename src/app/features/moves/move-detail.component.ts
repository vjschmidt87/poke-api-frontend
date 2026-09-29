import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, map, startWith, catchError } from 'rxjs/operators';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { Move } from './moves.model';

@Component({
  selector: 'app-move-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a routerLink="/moves" class="back-link">&larr; Back to Moves</a>

    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load move.</div>
      } @else {
        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        <div class="detail-section">
          <h3>Move Info</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Power</div>
              <div class="info-value">{{ vm.data.power ?? '---' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Accuracy</div>
              <div class="info-value">{{ vm.data.accuracy !== null ? vm.data.accuracy + '%' : '---' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">PP</div>
              <div class="info-value">{{ vm.data.pp ?? '---' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Priority</div>
              <div class="info-value">{{ vm.data.priority }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Type</div>
              <div class="info-value">
                <a class="detail-link" [routerLink]="'/pokemon/type/' + vm.data.type.name">
                  {{ vm.data.type.name | pokeName }}
                </a>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Damage Class</div>
              <div class="info-value">
                <a class="detail-link" [routerLink]="'/moves/damage-class/' + vm.data.damage_class.name">
                  {{ vm.data.damage_class.name | pokeName }}
                </a>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Target</div>
              <div class="info-value">
                <a class="detail-link" [routerLink]="'/moves/target/' + vm.data.target.name">
                  {{ vm.data.target.name | pokeName }}
                </a>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Generation</div>
              <div class="info-value">{{ vm.data.generation.name | pokeName }}</div>
            </div>
          </div>
        </div>

        @if (getEffectText(vm.data); as effect) {
          <div class="detail-section">
            <h3>Effect</h3>
            <p class="effect-text">{{ effect }}</p>
          </div>
        }

        @if (getShortEffect(vm.data); as shortEffect) {
          <div class="detail-section">
            <h3>Short Effect</h3>
            <p class="effect-text">{{ shortEffect }}</p>
          </div>
        }

        @if (vm.data.meta) {
          <div class="detail-section">
            <h3>Meta</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Ailment</div>
                <div class="info-value">
                  @if (vm.data.meta.ailment.name !== 'none') {
                    <a class="detail-link" [routerLink]="'/moves/ailment/' + vm.data.meta.ailment.name">
                      {{ vm.data.meta.ailment.name | pokeName }}
                    </a>
                  } @else {
                    None
                  }
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Category</div>
                <div class="info-value">
                  <a class="detail-link" [routerLink]="'/moves/category/' + vm.data.meta.category.name">
                    {{ vm.data.meta.category.name | pokeName }}
                  </a>
                </div>
              </div>
              @if (vm.data.meta.ailment_chance) {
                <div class="info-item">
                  <div class="info-label">Ailment Chance</div>
                  <div class="info-value">{{ vm.data.meta.ailment_chance }}%</div>
                </div>
              }
              @if (vm.data.meta.flinch_chance) {
                <div class="info-item">
                  <div class="info-label">Flinch Chance</div>
                  <div class="info-value">{{ vm.data.meta.flinch_chance }}%</div>
                </div>
              }
              @if (vm.data.meta.crit_rate) {
                <div class="info-item">
                  <div class="info-label">Crit Rate</div>
                  <div class="info-value">+{{ vm.data.meta.crit_rate }}</div>
                </div>
              }
              @if (vm.data.meta.drain) {
                <div class="info-item">
                  <div class="info-label">Drain</div>
                  <div class="info-value">{{ vm.data.meta.drain }}%</div>
                </div>
              }
              @if (vm.data.meta.healing) {
                <div class="info-item">
                  <div class="info-label">Healing</div>
                  <div class="info-value">{{ vm.data.meta.healing }}%</div>
                </div>
              }
            </div>
          </div>
        }

        @if (vm.data.stat_changes.length > 0) {
          <div class="detail-section">
            <h3>Stat Changes</h3>
            <ul class="link-list">
              @for (sc of vm.data.stat_changes; track sc.stat.name) {
                <li><span>{{ sc.stat.name | pokeName }}: {{ sc.change > 0 ? '+' : '' }}{{ sc.change }}</span></li>
              }
            </ul>
          </div>
        }

        @if (vm.data.learned_by_pokemon.length > 0) {
          <div class="detail-section">
            <h3>Learned By Pokemon ({{ vm.data.learned_by_pokemon.length }})</h3>
            <ul class="link-list">
              @for (pokemon of vm.data.learned_by_pokemon; track pokemon.name) {
                <li>
                  <a [routerLink]="'/pokemon/pokemon/' + pokemon.name">
                    {{ pokemon.name | pokeName }}
                  </a>
                </li>
              }
            </ul>
          </div>
        }
      }
    }
  `,
  styles: [`
    @use 'variables' as *;

    .effect-text {
      font-size: $font-size-base;
      color: $color-text-secondary;
      line-height: 1.6;
    }
  `],
})
export class MoveDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.paramMap.pipe(
    switchMap(params =>
      this.api.getResource<Move>('move', params.get('name')!).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as Move | null, loading: false })),
      ),
    ),
    startWith({ data: null as Move | null, loading: true }),
  );

  getEffectText(move: Move): string | null {
    const entry = move.effect_entries.find(e => e.language.name === 'en');
    if (!entry) return null;
    return entry.effect.replace('$effect_chance', String(move.effect_chance ?? ''));
  }

  getShortEffect(move: Move): string | null {
    const entry = move.effect_entries.find(e => e.language.name === 'en');
    if (!entry) return null;
    return entry.short_effect.replace('$effect_chance', String(move.effect_chance ?? ''));
  }
}
