import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface GroupCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  endpoints: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="home">
      <header class="hero">
        <h1>PokéAPI Explorer</h1>
        <p>Browse and explore data from the Pokémon universe</p>
      </header>
      <div class="grid">
        @for (card of groups; track card.route) {
          <a [routerLink]="card.route" class="card">
            <span class="card-icon">{{ card.icon }}</span>
            <h2>{{ card.title }}</h2>
            <p>{{ card.description }}</p>
            <div class="endpoints">
              @for (ep of card.endpoints; track ep) {
                <span class="endpoint-tag">{{ ep }}</span>
              }
            </div>
          </a>
        }
      </div>
    </div>
  `,
  styles: [`
    .home { max-width: 1200px; margin: 0 auto; }

    .hero {
      text-align: center;
      margin-bottom: 2.5rem;

      h1 {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-bold);
        color: var(--color-text);
        margin-bottom: 0.5rem;
      }

      p { color: var(--color-text-muted); font-size: var(--font-size-lg); }
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .card {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      border: 1px solid var(--color-border);
      text-decoration: none;
      color: inherit;
      transition: all 0.2s;
      display: block;

      &:hover {
        border-color: var(--color-primary);
        box-shadow: 0 4px 12px var(--color-primary-shadow);
        transform: translateY(-2px);
      }

      h2 {
        font-size: var(--font-size-lg);
        font-weight: var(--font-semibold);
        color: var(--color-text);
        margin: 0.5rem 0 0.25rem;
      }

      p {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin-bottom: 0.75rem;
        line-height: 1.5;
      }
    }

    .card-icon { font-size: var(--font-size-2xl); }

    .endpoints {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
    }

    .endpoint-tag {
      font-size: var(--font-size-xxs);
      padding: 0.125rem 0.5rem;
      background: var(--color-primary-light-bg);
      color: var(--color-primary);
      border-radius: 999px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  groups: GroupCard[] = [
    {
      title: 'Pokémon',
      description: 'All Pokémon data including abilities, types, forms, species, and stats.',
      icon: '⚡',
      route: '/pokemon',
      endpoints: ['Pokemon', 'Abilities', 'Types', 'Species', 'Natures', 'Egg Groups', 'Stats', 'Forms', 'Growth Rates'],
    },
    {
      title: 'Moves',
      description: 'Battle moves with damage classes, ailments, targets, and learn methods.',
      icon: '💥',
      route: '/moves',
      endpoints: ['Moves', 'Ailments', 'Damage Classes', 'Categories', 'Targets', 'Learn Methods'],
    },
    {
      title: 'Items',
      description: 'Items, their attributes, categories, fling effects, and pockets.',
      icon: '🎒',
      route: '/items',
      endpoints: ['Items', 'Attributes', 'Categories', 'Fling Effects', 'Pockets'],
    },
    {
      title: 'Berries',
      description: 'Berry details with firmness and flavor data.',
      icon: '🍓',
      route: '/berries',
      endpoints: ['Berries', 'Firmnesses', 'Flavors'],
    },
    {
      title: 'Evolution',
      description: 'Evolution chains and triggers showing how Pokémon evolve.',
      icon: '🔄',
      route: '/evolution',
      endpoints: ['Evolution Chains', 'Triggers'],
    },
    {
      title: 'Games',
      description: 'Generations, versions, version groups, and Pokédexes.',
      icon: '🎮',
      route: '/games',
      endpoints: ['Generations', 'Versions', 'Version Groups', 'Pokédexes'],
    },
    {
      title: 'Locations',
      description: 'Regions, locations, location areas, and Pal Park areas.',
      icon: '🗺️',
      route: '/locations',
      endpoints: ['Regions', 'Locations', 'Location Areas', 'Pal Park Areas'],
    },
    {
      title: 'Contests',
      description: 'Contest types, effects, and super contest effects.',
      icon: '🏆',
      route: '/contests',
      endpoints: ['Contest Types', 'Contest Effects', 'Super Contest Effects'],
    },
    {
      title: 'Encounters',
      description: 'Methods, conditions, and condition values for wild encounters.',
      icon: '🌿',
      route: '/encounters',
      endpoints: ['Methods', 'Conditions', 'Condition Values'],
    },
    {
      title: 'Machines',
      description: 'TMs and HMs that teach moves to Pokémon.',
      icon: '💿',
      route: '/machines',
      endpoints: ['Machines'],
    },
  ];
}
