import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../core/services/theme.service';

interface NavGroup {
  label: string;
  icon: string;
  route: string;
  usePokeball?: boolean;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout" [class.sidebar-collapsed]="sidebarCollapsed()">
      <aside class="sidebar">
        <div class="sidebar-header">
          <img src="https://raw.githubusercontent.com/PokeAPI/media/master/logo/pokeapi_256.png"
               alt="PokeAPI" class="logo" />
          <button class="toggle-btn" (click)="toggleSidebar()">
            {{ sidebarCollapsed() ? '&#9654;' : '&#9664;' }}
          </button>
        </div>
        <nav class="nav">
          @for (group of navGroups; track group.route) {
            <a [routerLink]="group.route"
               routerLinkActive="active"
               [routerLinkActiveOptions]="{ exact: group.route === '/' }"
               class="nav-item">
              <span class="nav-icon">
                @if (group.usePokeball) {
                  <svg viewBox="0 0 100 100" width="20" height="20">
                    <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" stroke-width="6"/>
                    <path d="M2,50 h96" stroke="currentColor" stroke-width="6"/>
                    <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" stroke-width="6"/>
                    <path d="M50,2 A48,48 0 0,1 98,50 H2 A48,48 0 0,1 50,2Z" fill="#dc2626"/>
                    <path d="M50,98 A48,48 0 0,1 2,50 H98 A48,48 0 0,1 50,98Z" fill="white"/>
                    <line x1="2" y1="50" x2="98" y2="50" stroke="currentColor" stroke-width="5"/>
                    <circle cx="50" cy="50" r="14" fill="white" stroke="currentColor" stroke-width="5"/>
                    <circle cx="50" cy="50" r="7" fill="currentColor"/>
                  </svg>
                } @else {
                  {{ group.icon }}
                }
              </span>
              <span class="nav-label">{{ group.label }}</span>
            </a>
          }
        </nav>
        <div class="sidebar-footer">
          <button class="theme-toggle" (click)="theme.toggle()">
            <span class="nav-icon theme-icon">
              @if (theme.isDark()) {
                <img
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/196.png"
                  alt="Espeon"
                  class="theme-sprite"
                  (error)="espeonFailed = true"
                />
                @if (espeonFailed) { ☀️ }
              } @else {
                <img
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/197.png"
                  alt="Umbreon"
                  class="theme-sprite"
                  (error)="umbreonFailed = true"
                />
                @if (umbreonFailed) { 🌙 }
              }
            </span>
            <span class="nav-label">{{ theme.isDark() ? 'Light Mode' : 'Dark Mode' }}</span>
          </button>
        </div>
      </aside>
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  theme = inject(ThemeService);
  sidebarCollapsed = signal(false);
  espeonFailed = false;
  umbreonFailed = false;

  navGroups: NavGroup[] = [
    { label: 'Home', icon: '🏠', route: '/' },
    { label: 'Pokémon', icon: '', route: '/pokemon', usePokeball: true },
    { label: 'Moves', icon: '💥', route: '/moves' },
    { label: 'Items', icon: '🎒', route: '/items' },
    { label: 'Berries', icon: '🍓', route: '/berries' },
    { label: 'Evolution', icon: '🔄', route: '/evolution' },
    { label: 'Games', icon: '🎮', route: '/games' },
    { label: 'Locations', icon: '🗺️', route: '/locations' },
    { label: 'Contests', icon: '🏆', route: '/contests' },
    { label: 'Encounters', icon: '🌿', route: '/encounters' },
    { label: 'Machines', icon: '💿', route: '/machines' },
  ];

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }
}
