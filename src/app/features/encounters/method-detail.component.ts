import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of, switchMap, map, startWith, catchError } from 'rxjs';

import { PokeApiService } from '../../core/services/pokeapi.service';
import { EncounterMethod } from './encounters.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';

@Component({
  selector: 'app-method-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load encounter method.</div>
      } @else {
        <a class="back-link" routerLink="/encounters">&larr; Back to Encounters</a>

        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        <div class="detail-section">
          <h3>Details</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Order</div>
              <div class="info-value">{{ vm.data.order }}</div>
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
export class MethodDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<EncounterMethod>('encounter-method', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as EncounterMethod | null, loading: false })),
      ),
    ),
    startWith({ data: null as EncounterMethod | null, loading: true }),
  );
}
