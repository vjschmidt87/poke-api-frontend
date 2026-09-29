import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, map, startWith, catchError } from 'rxjs/operators';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { TypeDetail } from './pokemon.model';

@Component({
  selector: 'app-type-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a routerLink="/pokemon" class="back-link">&larr; Back to Pokemon</a>

    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load type.</div>
      } @else {
        <div class="detail-header">
          <h1>
            {{ vm.data.name | pokeName }}
          </h1>
        </div>

        <div class="detail-section">
          <h3>Damage Relations</h3>

          @if (vm.data.damage_relations.double_damage_to.length > 0) {
            <div class="damage-group">
              <h4>Double Damage To</h4>
              <ul class="link-list">
                @for (t of vm.data.damage_relations.double_damage_to; track t.name) {
                  <li><a [routerLink]="['/pokemon/type', t.name]">{{ t.name | pokeName }}</a></li>
                }
              </ul>
            </div>
          }

          @if (vm.data.damage_relations.double_damage_from.length > 0) {
            <div class="damage-group">
              <h4>Double Damage From</h4>
              <ul class="link-list">
                @for (t of vm.data.damage_relations.double_damage_from; track t.name) {
                  <li><a [routerLink]="['/pokemon/type', t.name]">{{ t.name | pokeName }}</a></li>
                }
              </ul>
            </div>
          }

          @if (vm.data.damage_relations.half_damage_to.length > 0) {
            <div class="damage-group">
              <h4>Half Damage To</h4>
              <ul class="link-list">
                @for (t of vm.data.damage_relations.half_damage_to; track t.name) {
                  <li><a [routerLink]="['/pokemon/type', t.name]">{{ t.name | pokeName }}</a></li>
                }
              </ul>
            </div>
          }

          @if (vm.data.damage_relations.half_damage_from.length > 0) {
            <div class="damage-group">
              <h4>Half Damage From</h4>
              <ul class="link-list">
                @for (t of vm.data.damage_relations.half_damage_from; track t.name) {
                  <li><a [routerLink]="['/pokemon/type', t.name]">{{ t.name | pokeName }}</a></li>
                }
              </ul>
            </div>
          }

          @if (vm.data.damage_relations.no_damage_to.length > 0) {
            <div class="damage-group">
              <h4>No Damage To</h4>
              <ul class="link-list">
                @for (t of vm.data.damage_relations.no_damage_to; track t.name) {
                  <li><a [routerLink]="['/pokemon/type', t.name]">{{ t.name | pokeName }}</a></li>
                }
              </ul>
            </div>
          }

          @if (vm.data.damage_relations.no_damage_from.length > 0) {
            <div class="damage-group">
              <h4>No Damage From</h4>
              <ul class="link-list">
                @for (t of vm.data.damage_relations.no_damage_from; track t.name) {
                  <li><a [routerLink]="['/pokemon/type', t.name]">{{ t.name | pokeName }}</a></li>
                }
              </ul>
            </div>
          }
        </div>

        @if (vm.data.pokemon.length > 0) {
          <div class="detail-section">
            <h3>Pokemon of this Type</h3>
            <ul class="link-list">
              @for (entry of vm.data.pokemon; track entry.pokemon.name) {
                <li><a [routerLink]="['/pokemon/pokemon', entry.pokemon.name]">{{ entry.pokemon.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        }
      }
    }
  `,
  styles: [`
    .damage-group {
      margin-bottom: 1rem;

      h4 {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin-bottom: 0.375rem;
      }
    }
  `],
})
export class TypeDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<TypeDetail>('type', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as TypeDetail | null, loading: false })),
      ),
    ),
    startWith({ data: null as TypeDetail | null, loading: true }),
  );
}
