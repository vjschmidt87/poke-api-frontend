import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of, switchMap, map, startWith, catchError } from 'rxjs';

import { PokeApiService } from '../../core/services/pokeapi.service';
import { EncounterCondition } from './encounters.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';

@Component({
  selector: 'app-condition-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load condition.</div>
      } @else {
        <a class="back-link" routerLink="/encounters">&larr; Back to Encounters</a>

        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        @if (vm.data.values.length > 0) {
          <div class="detail-section">
            <h3>Condition Values</h3>
            <ul class="link-list">
              @for (value of vm.data.values; track value.name) {
                <li><a [routerLink]="'/encounters/condition-value/' + value.name">{{ value.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        }

        @if (vm.data.names.length > 0) {
          <div class="detail-section">
            <h3>Names in Other Languages</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Language</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                @for (name of vm.data.names; track name.language.name) {
                  <tr>
                    <td>{{ name.language.name | pokeName }}</td>
                    <td>{{ name.name }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    }
  `,
})
export class ConditionDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<EncounterCondition>('encounter-condition', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as EncounterCondition | null, loading: false })),
      ),
    ),
    startWith({ data: null as EncounterCondition | null, loading: true }),
  );
}
