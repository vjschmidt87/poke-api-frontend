import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { of, switchMap, map, startWith, catchError } from 'rxjs';

import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { ContestType } from './contests.model';

@Component({
  selector: 'app-contest-type-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load contest type.</div>
      } @else {
        <a routerLink="/contests" class="back-link">&larr; Back to Contests</a>

        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        <div class="detail-section">
          <h3>General Info</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Berry Flavor</div>
              <div class="info-value">
                <a [routerLink]="['/berries/flavor', vm.data.berry_flavor.name]" class="detail-link">
                  {{ vm.data.berry_flavor.name | pokeName }}
                </a>
              </div>
            </div>
          </div>
        </div>

        @if (vm.data.names.length > 0) {
          <div class="detail-section">
            <h3>Names in Other Languages</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Language</th>
                  <th>Name</th>
                  <th>Color</th>
                </tr>
              </thead>
              <tbody>
                @for (entry of vm.data.names; track entry.language.name) {
                  <tr>
                    <td>{{ entry.language.name | pokeName }}</td>
                    <td>{{ entry.name }}</td>
                    <td>
                      <span class="color-indicator" [style.background]="entry.color">
                        {{ entry.color }}
                      </span>
                    </td>
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
    .color-indicator {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      border-radius: var(--radius-sm);
      color: #fff;
      font-size: var(--font-size-sm);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
  `],
})
export class ContestTypeDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<ContestType>('contest-type', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as ContestType | null, loading: false })),
      ),
    ),
    startWith({ data: null as ContestType | null, loading: true }),
  );
}
