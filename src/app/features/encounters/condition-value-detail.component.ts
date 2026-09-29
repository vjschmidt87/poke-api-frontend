import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of, switchMap, map, startWith, catchError } from 'rxjs';

import { PokeApiService } from '../../core/services/pokeapi.service';
import { EncounterConditionValue } from './encounters.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';

@Component({
  selector: 'app-condition-value-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load condition value.</div>
      } @else {
        <a class="back-link" routerLink="/encounters">&larr; Back to Encounters</a>

        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        <div class="detail-section">
          <h3>Condition</h3>
          <a class="detail-link" [routerLink]="'/encounters/condition/' + vm.data.condition.name">
            {{ vm.data.condition.name | pokeName }}
          </a>
        </div>

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
export class ConditionValueDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<EncounterConditionValue>('encounter-condition-value', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as EncounterConditionValue | null, loading: false })),
      ),
    ),
    startWith({ data: null as EncounterConditionValue | null, loading: true }),
  );
}
