import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { of, switchMap, map, startWith, catchError } from 'rxjs';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { EvolutionTrigger } from './evolution.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';

@Component({
  selector: 'app-trigger-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load trigger.</div>
      } @else {
        <a routerLink="/evolution" class="back-link">&larr; Back to Evolution</a>

        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        @if (vm.data.names.length > 0) {
          <div class="detail-section">
            <h3>Names</h3>
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
                    <td>{{ name.language.name }}</td>
                    <td>{{ name.name }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <div class="detail-section">
          <h3>Pokemon Species ({{ vm.data.pokemon_species.length }})</h3>
          @if (vm.data.pokemon_species.length > 0) {
            <ul class="link-list">
              @for (species of vm.data.pokemon_species; track species.name) {
                <li><a [routerLink]="['/pokemon/species', species.name]">{{ species.name | pokeName }}</a></li>
              }
            </ul>
          } @else {
            <div class="empty-state">No species use this trigger.</div>
          }
        </div>
      }
    }
  `,
})
export class TriggerDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<EvolutionTrigger>('evolution-trigger', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as EvolutionTrigger | null, loading: false })),
      ),
    ),
    startWith({ data: null as EvolutionTrigger | null, loading: true }),
  );
}
