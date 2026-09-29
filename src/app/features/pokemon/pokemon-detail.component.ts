import { Component, ChangeDetectionStrategy, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of, forkJoin } from 'rxjs';
import { switchMap, map, startWith, catchError } from 'rxjs/operators';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { Pokemon, PokemonMoveEntry, Ability } from './pokemon.model';

interface MoveRow {
  moveName: string;
  level: number;
  method: string;
  versionGroup: string;
}

interface MethodGroup {
  method: string;
  moves: MoveRow[];
}

interface AbilityInfo {
  name: string;
  isHidden: boolean;
  shortEffect: string;
}

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a routerLink="/pokemon" class="back-link">&larr; Back to Pokemon</a>

    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load Pokemon.</div>
      } @else {
        <div class="detail-header">
          @if (getSpriteUrl(vm.data)) {
            <img
              [src]="getSpriteUrl(vm.data)"
              [alt]="vm.data.name"
              class="pokemon-sprite"
            />
          }
          <div>
            <h1>
              {{ vm.data.name | pokeName }}
            </h1>
            <ul class="link-list">
              @for (t of vm.data.types; track t.slot) {
                <li><a [routerLink]="['/pokemon/type', t.type.name]">{{ t.type.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        </div>

        <div class="detail-section">
          <h3>Info</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Height</div>
              <div class="info-value">{{ vm.data.height / 10 }} m</div>
            </div>
            <div class="info-item">
              <div class="info-label">Weight</div>
              <div class="info-value">{{ vm.data.weight / 10 }} kg</div>
            </div>
            <div class="info-item">
              <div class="info-label">Base Experience</div>
              <div class="info-value">{{ vm.data.base_experience }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Species</div>
              <div class="info-value">
                <a [routerLink]="['/pokemon/species', vm.data.species.name]">
                  {{ vm.data.species.name | pokeName }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Base Stats</h3>
          @for (stat of vm.data.stats; track stat.stat.name) {
            <div class="stat-row">
              <span class="stat-label">{{ stat.stat.name | pokeName }}</span>
              <div class="stat-bar-container">
                <div
                  class="stat-bar"
                  [style.width.%]="(stat.base_stat / 255) * 100"
                ></div>
              </div>
              <span class="stat-value">{{ stat.base_stat }}</span>
            </div>
          }
        </div>

        <div class="detail-section">
          <h3>Abilities</h3>
          <div class="abilities-list">
            @for (a of abilityInfos(); track a.name) {
              <div class="ability-item">
                <a [routerLink]="['/pokemon/ability', a.name]" class="ability-name">
                  {{ a.name | pokeName }}@if (a.isHidden) { <span class="ability-hidden">(Hidden)</span> }
                </a>
                @if (a.shortEffect) {
                  <p class="ability-effect">{{ a.shortEffect }}</p>
                }
              </div>
            }
          </div>
        </div>

        <div class="detail-section">
          <h3>Moves ({{ vm.data.moves.length }})</h3>

          <div class="moves-version-filter">
            <label>Version Group:</label>
            <select (change)="onVersionChange($event, vm.data.moves)">
              <option value="">Latest per move</option>
              @for (vg of getVersionGroups(vm.data.moves); track vg) {
                <option [value]="vg">{{ vg | pokeName }}</option>
              }
            </select>
          </div>

          @for (group of moveGroups(); track group.method) {
            <div class="method-group" [class.collapsed]="!expandedMethods()[group.method]">
              <button class="method-title" (click)="toggleMethod(group.method)">
                <span>{{ group.method | pokeName }} ({{ group.moves.length }})</span>
                <span class="method-arrow">{{ expandedMethods()[group.method] ? '▾' : '▸' }}</span>
              </button>
              @if (expandedMethods()[group.method]) {
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Move</th>
                      <th>Level</th>
                      <th>Version Group</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of group.moves; track row.moveName + row.versionGroup) {
                      <tr>
                        <td>
                          <a [routerLink]="['/moves/move', row.moveName]">
                            {{ row.moveName | pokeName }}
                          </a>
                        </td>
                        <td>{{ row.level || '—' }}</td>
                        <td>
                          <a [routerLink]="['/games/version-group', row.versionGroup]">
                            {{ row.versionGroup | pokeName }}
                          </a>
                        </td>
                    </tr>
                  }
                </tbody>
              </table>
              }
            </div>
          }
        </div>
      }
    }
  `,
  styles: [`
    @use 'variables' as *;

    .pokemon-sprite {
      width: 140px;
      height: 140px;
      object-fit: contain;
    }

    .info-value a {
      color: $color-primary;
      &:hover { text-decoration: underline; }
    }

    .abilities-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .ability-item {
      padding-bottom: 0.75rem;
      border-bottom: 1px solid $color-border-light;

      &:last-child { border-bottom: none; padding-bottom: 0; }
    }

    .ability-name {
      font-weight: $font-semibold;
      font-size: $font-size-md;
      color: $color-primary;
      &:hover { text-decoration: underline; }
    }

    .ability-hidden {
      font-weight: 400;
      font-size: $font-size-base;
      color: $color-text-muted;
      margin-left: 0.25rem;
    }

    .ability-effect {
      margin-top: 0.25rem;
      font-size: $font-size-base;
      color: $color-text-secondary;
      line-height: 1.5;
    }

    .moves-version-filter {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.25rem;

      label {
        font-size: $font-size-sm;
        color: $color-text-muted;
        font-weight: $font-semibold;
      }

      select {
        padding: 0.375rem 0.75rem;
        border: 1px solid $color-border;
        border-radius: $radius-input;
        font-size: $font-size-sm;
        color: $color-text-secondary;
        background: $color-input-bg;
        cursor: pointer;

        &:focus { outline: none; border-color: $color-primary; }
      }
    }

    .method-group {
      margin-bottom: 1.5rem;

      &:last-child { margin-bottom: 0; }
    }

    .method-title {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: $font-size-sm;
      font-weight: $font-semibold;
      color: $color-primary;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 0.625rem 0;
      border: none;
      border-bottom: 2px solid $color-primary-light-bg;
      background: none;
      cursor: pointer;
      transition: color 0.15s;

      &:hover { color: $color-primary-hover; }
    }

    .method-arrow {
      color: $color-border;
      font-size: 1rem;
    }

    .collapsed .method-title {
      color: $color-text-muted;
      border-bottom-color: $color-border-light;
    }
  `],
})
export class PokemonDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);
  private readonly destroyRef = inject(DestroyRef);

  moveGroups = signal<MethodGroup[]>([]);
  expandedMethods = signal<Record<string, boolean>>({ 'level-up': true });
  abilityInfos = signal<AbilityInfo[]>([]);
  private cachedVersionGroups: string[] = [];

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<Pokemon>('pokemon', params['name']).pipe(
        map(data => {
          this.cachedVersionGroups = this.buildVersionGroups(data.moves);
          this.buildMoveGroups(data.moves, '');
          this.loadAbilities(data);
          return { data, loading: false };
        }),
        catchError(() => of({ data: null as Pokemon | null, loading: false })),
      ),
    ),
    startWith({ data: null as Pokemon | null, loading: true }),
  );

  getSpriteUrl(pokemon: Pokemon): string {
    return (
      pokemon.sprites.other?.['official-artwork']?.front_default ||
      pokemon.sprites.front_default ||
      ''
    );
  }

  getVersionGroups(_moves: PokemonMoveEntry[]): string[] {
    return this.cachedVersionGroups;
  }

  toggleMethod(method: string) {
    this.expandedMethods.update(prev => ({
      ...prev,
      [method]: !prev[method],
    }));
  }

  onVersionChange(event: Event, moves: PokemonMoveEntry[]) {
    const value = (event.target as HTMLSelectElement).value;
    this.buildMoveGroups(moves, value);
  }

  private loadAbilities(pokemon: Pokemon) {
    const requests = pokemon.abilities.map(a =>
      this.api.getResource<Ability>('ability', a.ability.name).pipe(
        map(ability => {
          const entry = ability.effect_entries.find(e => e.language.name === 'en');
          return {
            name: a.ability.name,
            isHidden: a.is_hidden,
            shortEffect: entry?.short_effect ?? '',
          } as AbilityInfo;
        }),
        catchError(() => of({
          name: a.ability.name,
          isHidden: a.is_hidden,
          shortEffect: '',
        } as AbilityInfo)),
      ),
    );
    forkJoin(requests).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(infos => this.abilityInfos.set(infos));
  }

  private buildVersionGroups(moves: PokemonMoveEntry[]): string[] {
    const vgSet = new Set<string>();
    for (const m of moves) {
      for (const d of m.version_group_details) {
        vgSet.add(d.version_group.name);
      }
    }
    return Array.from(vgSet).sort();
  }

  private buildMoveGroups(moves: PokemonMoveEntry[], versionFilter: string) {
    const rows: MoveRow[] = [];

    for (const m of moves) {
      const details = m.version_group_details;
      if (!details.length) continue;

      if (versionFilter) {
        const matching = details.filter(d => d.version_group.name === versionFilter);
        for (const d of matching) {
          rows.push({
            moveName: m.move.name,
            level: d.level_learned_at,
            method: d.move_learn_method.name,
            versionGroup: d.version_group.name,
          });
        }
      } else {
        const latest = details[details.length - 1];
        rows.push({
          moveName: m.move.name,
          level: latest.level_learned_at,
          method: latest.move_learn_method.name,
          versionGroup: latest.version_group.name,
        });
      }
    }

    const methodOrder = ['level-up', 'machine', 'tutor', 'egg'];
    const groupMap = new Map<string, MoveRow[]>();
    for (const row of rows) {
      const list = groupMap.get(row.method) || [];
      list.push(row);
      groupMap.set(row.method, list);
    }

    const groups: MethodGroup[] = [];
    for (const method of methodOrder) {
      if (groupMap.has(method)) {
        const movesForMethod = groupMap.get(method)!;
        movesForMethod.sort((a, b) => {
          if (method === 'level-up') return a.level - b.level;
          return a.moveName.localeCompare(b.moveName);
        });
        groups.push({ method, moves: movesForMethod });
        groupMap.delete(method);
      }
    }
    for (const [method, movesForMethod] of groupMap) {
      movesForMethod.sort((a, b) => a.moveName.localeCompare(b.moveName));
      groups.push({ method, moves: movesForMethod });
    }

    this.moveGroups.set(groups);
  }
}
