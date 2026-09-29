import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { of, switchMap, map, startWith, catchError } from 'rxjs';

import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';

import { ItemFlingEffect } from './models/item.model';

@Component({
  selector: 'app-fling-effect-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load fling effect.</div>
      } @else {
        <a routerLink="/items" class="back-link">&larr; Back to Items</a>

        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        @if (getEffect(vm.data); as effectText) {
          <div class="detail-section">
            <h3>Effect</h3>
            <p class="effect-text">{{ effectText }}</p>
          </div>
        }

        @if (vm.data.items.length > 0) {
          <div class="detail-section">
            <h3>Items with this Fling Effect</h3>
            <div class="resource-grid">
              @for (item of vm.data.items; track item.name) {
                <a class="resource-card" [routerLink]="['/items/item', item.name]">
                  <span class="resource-name">{{ item.name | pokeName }}</span>
                </a>
              }
            </div>
          </div>
        } @else {
          <div class="empty-state">No items use this fling effect.</div>
        }
      }
    }
  `,
  styles: [`
    .effect-text {
      font-size: var(--font-size-md);
      color: var(--color-text-secondary);
      line-height: 1.7;
    }
  `],
})
export class FlingEffectDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<ItemFlingEffect>('item-fling-effect', params['id']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as ItemFlingEffect | null, loading: false })),
      ),
    ),
    startWith({ data: null as ItemFlingEffect | null, loading: true }),
  );

  getEffect(effect: ItemFlingEffect): string | null {
    const entry = effect.effect_entries.find(e => e.language.name === 'en');
    return entry?.effect ?? null;
  }
}
