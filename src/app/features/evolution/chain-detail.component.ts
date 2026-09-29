import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { of } from 'rxjs';
import { switchMap, map, startWith, catchError } from 'rxjs/operators';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { EvolutionChain, ChainLink, EvolutionDetail } from './evolution.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';

interface EvolutionNode {
  species: { name: string; url: string };
  isBaby: boolean;
  details: EvolutionDetail[];
  children: EvolutionNode[];
}

interface RequirementLine {
  label: string;
  value: string;
  link?: string;
}

@Component({
  selector: 'app-chain-detail',
  standalone: true,
  imports: [AsyncPipe, NgTemplateOutlet, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a routerLink="/evolution" class="back-link">← Back to Evolution</a>

    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load evolution chain.</div>
      } @else {
        <div class="detail-header">
          <h1>Evolution Chain</h1>
        </div>

        @if (vm.data.baby_trigger_item) {
          <div class="detail-section">
            <h3>Baby Trigger Item</h3>
            <a [routerLink]="['/items/item', vm.data.baby_trigger_item.name]" class="detail-link">
              {{ vm.data.baby_trigger_item.name | pokeName }}
            </a>
          </div>
        }

        <div class="detail-section">
          <h3>Evolution Path</h3>
          <div class="chain-tree">
            @if (buildTree(vm.data.chain); as root) {
            <div class="tree-root">
              <ng-container
                [ngTemplateOutlet]="nodeTemplate"
                [ngTemplateOutletContext]="{ $implicit: root, isRoot: true }"
              />
            </div>
          }
        </div>
      </div>

      <ng-template #nodeTemplate let-node let-isRoot="isRoot">
        <div class="evo-node" [class.evo-root]="isRoot">
          @if (!isRoot && node.details.length > 0) {
            <div class="evo-arrow">
              <div class="arrow-line"></div>
              <div class="evo-requirements">
                @for (detail of node.details; track $index) {
                  <div class="requirement-group">
                    @for (req of getRequirements(detail); track req.label) {
                      <span class="requirement">
                        @if (req.link) {
                          <a [routerLink]="req.link" class="req-link">{{ req.label }}: {{ req.value }}</a>
                        } @else {
                          {{ req.label }}: {{ req.value }}
                        }
                      </span>
                    }
                  </div>
                }
              </div>
              <div class="arrow-tip">▼</div>
            </div>
          } @else if (!isRoot) {
            <div class="evo-arrow">
              <div class="arrow-line"></div>
              <div class="arrow-tip">▼</div>
            </div>
          }

          <a [routerLink]="['/pokemon/species', node.species.name]" class="species-card" [class.baby]="node.isBaby">
            <span class="species-sprite">
              <img
                [src]="getSpriteUrl(node.species.url)"
                [alt]="node.species.name"
                loading="lazy"
                (error)="onSpriteError($event)"
              />
            </span>
            <span class="species-name">{{ node.species.name | pokeName }}</span>
            @if (node.isBaby) {
              <span class="baby-badge">Baby</span>
            }
          </a>

          @if (node.children.length > 0) {
            <div class="evo-branches" [class.single-branch]="node.children.length === 1">
              @for (child of node.children; track child.species.name) {
                <div class="evo-branch">
                  <ng-container
                    [ngTemplateOutlet]="nodeTemplate"
                    [ngTemplateOutletContext]="{ $implicit: child, isRoot: false }"
                  />
                </div>
              }
            </div>
          }
        </div>
      </ng-template>
      }
    }
  `,
  styles: [`
    .chain-tree {
      padding: 1rem 0;
      overflow-x: auto;
    }

    .tree-root {
      display: flex;
      justify-content: center;
    }

    .evo-node {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .evo-arrow {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.5rem 0;
    }

    .arrow-line {
      width: 2px;
      height: 16px;
      background: var(--color-border);
    }

    .arrow-tip {
      color: var(--color-border);
      font-size: 0.625rem;
      line-height: 1;
      margin-top: -2px;
    }

    .evo-requirements {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.375rem 0;
    }

    .requirement-group {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.25rem;
    }

    .requirement {
      font-size: var(--font-size-xxs);
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      background: var(--color-success-bg);
      color: var(--color-success-text);
      white-space: nowrap;
    }

    .req-link {
      color: var(--color-success-text);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    .species-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.75rem 1.25rem;
      background: var(--color-surface);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      color: inherit;
      transition: all 0.15s;
      min-width: 100px;
      position: relative;

      &:hover {
        border-color: var(--color-primary);
        box-shadow: 0 4px 12px var(--color-primary-shadow);
        transform: translateY(-2px);
      }

      &.baby {
        border-color: var(--color-warning-accent);
        background: var(--color-warning-bg);
      }
    }

    .species-sprite {
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        image-rendering: pixelated;
      }
    }

    .species-name {
      font-weight: var(--font-semibold);
      font-size: var(--font-size-base);
      color: var(--color-text);
    }

    .baby-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      font-size: 0.625rem;
      font-weight: var(--font-semibold);
      padding: 0.125rem 0.375rem;
      border-radius: 999px;
      background: var(--color-warning-accent);
      color: var(--color-warning-text);
    }

    .evo-branches {
      display: flex;
      gap: 1rem;
      padding-top: 0;

      &.single-branch {
        gap: 0;
      }
    }

    .evo-branch {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

  `],
})
export class ChainDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.paramMap.pipe(
    switchMap(params =>
      this.api.getResource<EvolutionChain>('evolution-chain', params.get('id')!).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as EvolutionChain | null, loading: false })),
      ),
    ),
    startWith({ data: null as EvolutionChain | null, loading: true }),
  );

  buildTree(link: ChainLink): EvolutionNode {
    return {
      species: link.species,
      isBaby: link.is_baby,
      details: link.evolution_details,
      children: link.evolves_to.map(child => this.buildTree(child)),
    };
  }

  getSpriteUrl(speciesUrl: string): string {
    const id = this.api.getIdFromUrl(speciesUrl);
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }

  onSpriteError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  getRequirements(detail: EvolutionDetail): RequirementLine[] {
    const reqs: RequirementLine[] = [];

    if (detail.trigger) {
      reqs.push({
        label: 'Trigger',
        value: this.formatName(detail.trigger.name),
        link: `/evolution/trigger/${detail.trigger.name}`,
      });
    }

    if (detail.min_level !== null) {
      reqs.push({ label: 'Level', value: String(detail.min_level) });
    }

    if (detail.item) {
      reqs.push({
        label: 'Item',
        value: this.formatName(detail.item.name),
        link: `/items/item/${detail.item.name}`,
      });
    }

    if (detail.held_item) {
      reqs.push({
        label: 'Held item',
        value: this.formatName(detail.held_item.name),
        link: `/items/item/${detail.held_item.name}`,
      });
    }

    if (detail.min_happiness !== null) {
      reqs.push({ label: 'Happiness', value: `≥ ${detail.min_happiness}` });
    }

    if (detail.min_beauty !== null) {
      reqs.push({ label: 'Beauty', value: `≥ ${detail.min_beauty}` });
    }

    if (detail.min_affection !== null) {
      reqs.push({ label: 'Affection', value: `≥ ${detail.min_affection}` });
    }

    if (detail.time_of_day) {
      reqs.push({ label: 'Time', value: this.capitalize(detail.time_of_day) });
    }

    if (detail.known_move) {
      reqs.push({
        label: 'Known move',
        value: this.formatName(detail.known_move.name),
        link: `/moves/move/${detail.known_move.name}`,
      });
    }

    if (detail.known_move_type) {
      reqs.push({
        label: 'Move type',
        value: this.formatName(detail.known_move_type.name),
      });
    }

    if (detail.location) {
      reqs.push({
        label: 'Location',
        value: this.formatName(detail.location.name),
      });
    }

    if (detail.gender !== null) {
      reqs.push({ label: 'Gender', value: detail.gender === 1 ? 'Female' : 'Male' });
    }

    if (detail.needs_overworld_rain) {
      reqs.push({ label: 'Weather', value: 'Rain' });
    }

    if (detail.turn_upside_down) {
      reqs.push({ label: 'Special', value: 'Turn upside down' });
    }

    if (detail.party_species) {
      reqs.push({
        label: 'Party species',
        value: this.formatName(detail.party_species.name),
      });
    }

    if (detail.party_type) {
      reqs.push({
        label: 'Party type',
        value: this.formatName(detail.party_type.name),
      });
    }

    if (detail.trade_species) {
      reqs.push({
        label: 'Trade for',
        value: this.formatName(detail.trade_species.name),
      });
    }

    if (detail.relative_physical_stats !== null) {
      const statLabel =
        detail.relative_physical_stats === 1
          ? 'Atk > Def'
          : detail.relative_physical_stats === -1
            ? 'Atk < Def'
            : 'Atk = Def';
      reqs.push({ label: 'Stats', value: statLabel });
    }

    return reqs;
  }

  private formatName(name: string): string {
    return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
