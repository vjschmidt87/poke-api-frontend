import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, switchMap } from 'rxjs';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { NamedAPIResourceList, APIResourceList, NamedAPIResource } from '../../core/models/common.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { ExtractIdPipe } from '../../shared/pipes/extract-id.pipe';

@Component({
  selector: 'app-evolution-page',
  standalone: true,
  imports: [RouterLink, AsyncPipe, LoadingComponent, PaginationComponent, SearchBarComponent, PokeNamePipe, ExtractIdPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <h1>Evolution</h1>
      <p>Evolution chains and triggers showing how Pokemon evolve</p>
    </div>

    <div class="tabs">
      <button class="tab" [class.active]="activeTab() === 'chains'" (click)="activeTab.set('chains')">
        Evolution Chains
      </button>
      <button class="tab" [class.active]="activeTab() === 'triggers'" (click)="activeTab.set('triggers')">
        Triggers
      </button>
    </div>

    @if (activeTab() === 'chains') {
      @if (chains$ | async; as data) {
        <div class="resource-grid">
          @for (chain of data.results; track chain.url) {
            <a [routerLink]="['chain', chain.url | extractId]" class="resource-card">
              <span class="resource-name">Chain #{{ chain.url | extractId }}</span>
            </a>
          } @empty {
            <div class="empty-state">No evolution chains found.</div>
          }
        </div>
        <app-pagination
          [totalCount]="data.count"
          [pageSize]="chainsPageSize"
          [currentPage]="chainsPage()"
          (pageChange)="onChainsPageChange($event)"
        />
      } @else {
        <app-loading />
      }
    }

    @if (activeTab() === 'triggers') {
      <app-search-bar (searchChange)="onTriggerSearch($event)" />
      @if (allTriggers$ | async; as data) {
        @if (filteredTriggers(data.results).length > 0) {
          <div class="resource-grid">
            @for (trigger of paginatedTriggers(data.results); track trigger.name) {
              <a [routerLink]="['trigger', trigger.name]" class="resource-card">
                <span class="resource-name">{{ trigger.name | pokeName }}</span>
              </a>
            }
          </div>
          <app-pagination
            [totalCount]="filteredTriggers(data.results).length"
            [pageSize]="triggersPageSize"
            [currentPage]="triggersPage()"
            (pageChange)="triggersPage.set($event)"
          />
        } @else {
          <div class="empty-state">No triggers match your search.</div>
        }
      } @else {
        <app-loading />
      }
    }
  `,
})
export class EvolutionPageComponent {
  private readonly api = inject(PokeApiService);

  activeTab = signal<'chains' | 'triggers'>('chains');
  chainsPage = signal(1);
  triggersPage = signal(1);
  triggerSearch = signal('');
  chainsPageSize = 20;
  triggersPageSize = 20;

  private chainsPage$ = new BehaviorSubject<number>(1);

  chains$ = this.chainsPage$.pipe(
    switchMap(page =>
      this.api.getUnnamedResourceList('evolution-chain', this.chainsPageSize, (page - 1) * this.chainsPageSize),
    ),
  );

  allTriggers$ = this.api.getAllResources('evolution-trigger');

  onChainsPageChange(page: number) {
    this.chainsPage.set(page);
    this.chainsPage$.next(page);
  }

  onTriggerSearch(term: string) {
    this.triggerSearch.set(term);
    this.triggersPage.set(1);
  }

  filteredTriggers(triggers: NamedAPIResource[]): NamedAPIResource[] {
    const term = this.triggerSearch().toLowerCase();
    if (!term) return triggers;
    return triggers.filter(t => t.name.toLowerCase().includes(term));
  }

  paginatedTriggers(triggers: NamedAPIResource[]): NamedAPIResource[] {
    const filtered = this.filteredTriggers(triggers);
    const start = (this.triggersPage() - 1) * this.triggersPageSize;
    return filtered.slice(start, start + this.triggersPageSize);
  }
}
