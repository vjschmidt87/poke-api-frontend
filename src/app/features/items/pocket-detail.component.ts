import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { of, switchMap, map, startWith, catchError } from 'rxjs';

import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';

import { ItemPocket } from './models/item.model';

@Component({
  selector: 'app-pocket-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load pocket.</div>
      } @else {
        <a routerLink="/items" class="back-link">&larr; Back to Items</a>

        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        @if (vm.data.categories.length > 0) {
          <div class="detail-section">
            <h3>Categories in this Pocket</h3>
            <div class="resource-grid">
              @for (cat of vm.data.categories; track cat.name) {
                <a class="resource-card" [routerLink]="['/items/category', cat.name]">
                  <span class="resource-name">{{ cat.name | pokeName }}</span>
                </a>
              }
            </div>
          </div>
        } @else {
          <div class="empty-state">No categories in this pocket.</div>
        }
      }
    }
  `,
})
export class PocketDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<ItemPocket>('item-pocket', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as ItemPocket | null, loading: false })),
      ),
    ),
    startWith({ data: null as ItemPocket | null, loading: true }),
  );
}
