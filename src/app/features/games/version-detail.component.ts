import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { of, switchMap, map, startWith, catchError } from 'rxjs';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { Version } from './games.model';

@Component({
  selector: 'app-version-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load version.</div>
      } @else {
        <a routerLink="/games" class="back-link">&larr; Back to Games</a>

        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        <div class="detail-section">
          <h3>Info</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Version Group</div>
              <div class="info-value">
                <a routerLink="/games/version-group/{{ vm.data.version_group.name }}" class="detail-link">
                  {{ vm.data.version_group.name | pokeName }}
                </a>
              </div>
            </div>
          </div>
        </div>

        @if (getEnglishName(vm.data)) {
          <div class="detail-section">
            <h3>Localized Name</h3>
            <p>{{ getEnglishName(vm.data) }}</p>
          </div>
        }
      }
    }
  `,
})
export class VersionDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.params.pipe(
    switchMap(params =>
      this.api.getResource<Version>('version', params['name']).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as Version | null, loading: false })),
      ),
    ),
    startWith({ data: null as Version | null, loading: true }),
  );

  getEnglishName(version: Version): string {
    const en = version.names.find(n => n.language.name === 'en');
    return en ? en.name : '';
  }
}
