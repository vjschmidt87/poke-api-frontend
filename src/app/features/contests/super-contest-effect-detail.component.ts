import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { of, switchMap, map, startWith, catchError } from 'rxjs';

import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { SuperContestEffect } from './contests.model';

@Component({
  selector: 'app-super-contest-effect-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load super contest effect.</div>
      } @else {
        <a routerLink="/contests" class="back-link">&larr; Back to Contests</a>

        <div class="detail-header">
          <h1>Super Contest Effect #{{ vm.data.id }}</h1>
        </div>

        <div class="detail-section">
          <h3>Stats</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Appeal</div>
              <div class="info-value">{{ vm.data.appeal }}</div>
            </div>
          </div>
        </div>

        @if (vm.data.flavor_text_entries.length > 0) {
          <div class="detail-section">
            <h3>Flavor Text</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Language</th>
                  <th>Text</th>
                </tr>
              </thead>
              <tbody>
                @for (entry of vm.data.flavor_text_entries; track $index) {
                  <tr>
                    <td>{{ entry.language.name | pokeName }}</td>
                    <td>{{ entry.flavor_text }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (vm.data.moves.length > 0) {
          <div class="detail-section">
            <h3>Moves</h3>
            <ul class="link-list">
              @for (move of vm.data.moves; track move.name) {
                <li><a [routerLink]="['/moves/move', move.name]">{{ move.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        }
      }
    }
  `,
})
export class SuperContestEffectDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<SuperContestEffect>('super-contest-effect', params['id']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as SuperContestEffect | null, loading: false })),
      ),
    ),
    startWith({ data: null as SuperContestEffect | null, loading: true }),
  );
}
