import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest, of } from 'rxjs';
import { switchMap, map, startWith, catchError } from 'rxjs/operators';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { NamedAPIResource } from '../../core/models/common.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';

interface GenericResource {
  name: string;
  names?: { name: string; language: { name: string } }[];
  descriptions?: { description: string; language: { name: string } }[];
  pokemon_species?: NamedAPIResource[];
  pokemon_species_details?: { pokemon_species: NamedAPIResource }[];
  pokemon?: ({ pokemon: NamedAPIResource } | NamedAPIResource)[];
}

@Component({
  selector: 'app-resource-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a routerLink="/pokemon" class="back-link">&larr; Back to Pokemon</a>

    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load resource.</div>
      } @else {
        <div class="detail-header">
          <h1>
            {{ vm.data.name || 'Resource' | pokeName }}
          </h1>
        </div>

        @if (getEnglishName(vm.data)) {
          <div class="detail-section">
            <h3>{{ vm.title }}</h3>
            <p>{{ getEnglishName(vm.data) }}</p>
          </div>
        }

        @if (getDescription(vm.data)) {
          <div class="detail-section">
            <h3>Description</h3>
            <p>{{ getDescription(vm.data) }}</p>
          </div>
        }

        @if (getPokemonList(vm.data).length > 0) {
          <div class="detail-section">
            <h3>Related Pokemon</h3>
            <ul class="link-list">
              @for (p of getPokemonList(vm.data); track p.name) {
                <li><a [routerLink]="['/pokemon/pokemon', p.name]">{{ p.name | pokeName }}</a></li>
              }
            </ul>
          </div>
        }
      }
    }
  `,
})
export class ResourceDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = combineLatest([this.route.data, this.route.params]).pipe(
    switchMap(([data, params]) =>
      this.api.getResource<GenericResource>(data['endpoint'], params['name']).pipe(
        map(resource => ({
          data: resource,
          loading: false,
          title: data['title'] as string,
        })),
        catchError(() =>
          of({
            data: null as GenericResource | null,
            loading: false,
            title: data['title'] as string,
          }),
        ),
      ),
    ),
    startWith({ data: null as GenericResource | null, loading: true, title: '' }),
  );

  getEnglishName(resource: GenericResource): string {
    return resource.names?.find(n => n.language?.name === 'en')?.name || '';
  }

  getDescription(resource: GenericResource): string {
    const desc = resource.descriptions?.find(d => d.language?.name === 'en');
    return desc?.description || '';
  }

  getPokemonList(resource: GenericResource): NamedAPIResource[] {
    if (Array.isArray(resource.pokemon_species)) {
      return resource.pokemon_species;
    }
    if (Array.isArray(resource.pokemon_species_details)) {
      return resource.pokemon_species_details.map(d => d.pokemon_species);
    }
    if (Array.isArray(resource.pokemon)) {
      return resource.pokemon.map(p => ('pokemon' in p ? p.pokemon : p));
    }
    return [];
  }
}
