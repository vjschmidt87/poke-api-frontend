import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { of, switchMap, map, startWith, catchError } from 'rxjs';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { Machine } from './machines.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';

@Component({
  selector: 'app-machine-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load machine.</div>
      } @else {
        <a routerLink="/machines" class="back-link">&larr; Back to Machines</a>

        <div class="detail-header">
          <h1>Machine #{{ vm.data.id }}</h1>
        </div>

        <div class="detail-section">
          <h3>Machine Info</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">ID</div>
              <div class="info-value">{{ vm.data.id }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Item</div>
              <div class="info-value">
                <a
                  class="detail-link"
                  [routerLink]="'/items/item/' + vm.data.item.name"
                >
                  {{ vm.data.item.name | pokeName }}
                </a>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Move</div>
              <div class="info-value">
                <a
                  class="detail-link"
                  [routerLink]="'/moves/move/' + vm.data.move.name"
                >
                  {{ vm.data.move.name | pokeName }}
                </a>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Version Group</div>
              <div class="info-value">
                <a
                  class="detail-link"
                  [routerLink]="'/games/version-group/' + vm.data.version_group.name"
                >
                  {{ vm.data.version_group.name | pokeName }}
                </a>
              </div>
            </div>
          </div>
        </div>
      }
    }
  `,
})
export class MachineDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<Machine>('machine', params['id']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as Machine | null, loading: false })),
      ),
    ),
    startWith({ data: null as Machine | null, loading: true }),
  );
}
