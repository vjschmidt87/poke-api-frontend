import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { of, switchMap, map, startWith, catchError } from 'rxjs';

import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';

import { ItemCategory } from './models/item.model';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load category.</div>
      } @else {
        <a routerLink="/items" class="back-link">&larr; Back to Items</a>

        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        <div class="detail-section">
          <h3>Pocket</h3>
          <a class="detail-link" [routerLink]="['/items/pocket', vm.data.pocket.name]">
            {{ vm.data.pocket.name | pokeName }}
          </a>
        </div>

        @if (vm.data.items.length > 0) {
          <div class="detail-section">
            <h3>Items in this Category</h3>
            <div class="resource-grid">
              @for (item of vm.data.items; track item.name) {
                <a class="resource-card" [routerLink]="['/items/item', item.name]">
                  <span class="resource-name">{{ item.name | pokeName }}</span>
                </a>
              }
            </div>
          </div>
        } @else {
          <div class="empty-state">No items in this category.</div>
        }
      }
    }
  `,
})
export class CategoryDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<ItemCategory>('item-category', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as ItemCategory | null, loading: false })),
      ),
    ),
    startWith({ data: null as ItemCategory | null, loading: true }),
  );
}
