import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { of, switchMap, map, startWith, catchError } from 'rxjs';

import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';

import { ItemAttribute } from './models/item.model';

@Component({
  selector: 'app-attribute-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load attribute.</div>
      } @else {
        <a routerLink="/items" class="back-link">&larr; Back to Items</a>

        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        @if (getDescription(vm.data); as desc) {
          <div class="detail-section">
            <h3>Description</h3>
            <p class="description-text">{{ desc }}</p>
          </div>
        }

        @if (vm.data.items.length > 0) {
          <div class="detail-section">
            <h3>Items with this Attribute</h3>
            <div class="resource-grid">
              @for (item of vm.data.items; track item.name) {
                <a class="resource-card" [routerLink]="['/items/item', item.name]">
                  <span class="resource-name">{{ item.name | pokeName }}</span>
                </a>
              }
            </div>
          </div>
        } @else {
          <div class="empty-state">No items have this attribute.</div>
        }
      }
    }
  `,
  styles: [`
    .description-text {
      font-size: var(--font-size-md);
      color: var(--color-text-secondary);
      line-height: 1.7;
    }
  `],
})
export class AttributeDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<ItemAttribute>('item-attribute', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as ItemAttribute | null, loading: false })),
      ),
    ),
    startWith({ data: null as ItemAttribute | null, loading: true }),
  );

  getDescription(attr: ItemAttribute): string | null {
    const entry = attr.descriptions.find(d => d.language.name === 'en');
    return entry?.description ?? null;
  }
}
