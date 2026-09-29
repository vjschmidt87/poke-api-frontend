import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { of } from 'rxjs';
import { switchMap, map, startWith, catchError } from 'rxjs/operators';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { ExtractIdPipe } from '../../shared/pipes/extract-id.pipe';
import { Item } from './models/item.model';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe, ExtractIdPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a routerLink="/items" class="back-link">&larr; Back to Items</a>

    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load item.</div>
      } @else {

      <div class="detail-header">
        @if (vm.data.sprites.default) {
          <img [src]="vm.data.sprites.default" [alt]="vm.data.name" class="item-sprite" />
        }
        <h1>{{ vm.data.name | pokeName }}</h1>
      </div>

      <div class="detail-section">
        <h3>General Info</h3>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Cost</div>
            <div class="info-value">{{ vm.data.cost > 0 ? vm.data.cost + ' P' : 'Not buyable' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Category</div>
            <div class="info-value">
              <a [routerLink]="['/items/category', vm.data.category.name]" class="detail-link">
                {{ vm.data.category.name | pokeName }}
              </a>
            </div>
          </div>
          @if (vm.data.fling_power !== null) {
            <div class="info-item">
              <div class="info-label">Fling Power</div>
              <div class="info-value">{{ vm.data.fling_power }}</div>
            </div>
          }
          @if (vm.data.fling_effect) {
            <div class="info-item">
              <div class="info-label">Fling Effect</div>
              <div class="info-value">
                <a [routerLink]="['/items/fling-effect', (vm.data.fling_effect.url | extractId)]" class="detail-link">
                  {{ vm.data.fling_effect.name | pokeName }}
                </a>
              </div>
            </div>
          }
        </div>
      </div>

      @if (getEffectEntry(vm.data); as effect) {
        <div class="detail-section">
          <h3>Effect</h3>
          <p class="effect-text">{{ effect.effect }}</p>
          @if (effect.short_effect) {
            <p class="short-effect">{{ effect.short_effect }}</p>
          }
        </div>
      }

      @if (vm.data.attributes.length > 0) {
        <div class="detail-section">
          <h3>Attributes</h3>
          <ul class="link-list">
            @for (attr of vm.data.attributes; track attr.name) {
              <li><a [routerLink]="['/items/attribute', attr.name]">{{ attr.name | pokeName }}</a></li>
            }
          </ul>
        </div>
      }

      @if (vm.data.held_by_pokemon.length > 0) {
        <div class="detail-section">
          <h3>Held by Pokemon</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>Pokemon</th>
                <th>Version</th>
                <th>Rarity</th>
              </tr>
            </thead>
            <tbody>
              @for (holder of vm.data.held_by_pokemon; track holder.pokemon.name) {
                @for (vd of holder.version_details; track vd.version.name) {
                  <tr>
                    <td>
                      <a [routerLink]="['/pokemon/pokemon', holder.pokemon.name]">
                        {{ holder.pokemon.name | pokeName }}
                      </a>
                    </td>
                    <td>{{ vd.version.name | pokeName }}</td>
                    <td>{{ vd.rarity }}%</td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      }

      @if (getFlavorTexts(vm.data); as texts) {
        @if (texts.length > 0) {
          <div class="detail-section">
            <h3>Flavor Text</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Text</th>
                </tr>
              </thead>
              <tbody>
                @for (entry of texts; track $index) {
                  <tr>
                    <td>{{ (entry.version_group?.name ?? '') | pokeName }}</td>
                    <td>{{ entry.flavor_text }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
      }
    }
  `,
  styles: [`
    .item-sprite {
      width: 48px;
      height: 48px;
      image-rendering: pixelated;
    }

    .effect-text {
      font-size: var(--font-size-md);
      color: var(--color-text-secondary);
      line-height: 1.7;
      margin-bottom: 0.5rem;
    }

    .short-effect {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      font-style: italic;
    }

  `],
})
export class ItemDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<Item>('item', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as Item | null, loading: false })),
      ),
    ),
    startWith({ data: null as Item | null, loading: true }),
  );

  getEffectEntry(item: Item) {
    return item.effect_entries.find(e => e.language.name === 'en') ?? null;
  }

  getFlavorTexts(item: Item) {
    return item.flavor_text_entries.filter(e => e.language.name === 'en');
  }
}
