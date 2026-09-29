import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, map, startWith, catchError } from 'rxjs/operators';
import { PokeApiService } from '../../core/services/pokeapi.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { PokeNamePipe } from '../../shared/pipes/capitalize.pipe';
import { MoveLearnMethod } from './moves.model';

@Component({
  selector: 'app-learn-method-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, LoadingComponent, PokeNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a routerLink="/moves" class="back-link">&larr; Back to Moves</a>

    @if (vm$ | async; as vm) {
      @if (vm.loading) {
        <app-loading />
      } @else if (!vm.data) {
        <div class="empty-state">Failed to load learn method.</div>
      } @else {
        <div class="detail-header">
          <h1>{{ vm.data.name | pokeName }}</h1>
        </div>

        @if (getDescription(vm.data); as desc) {
          <div class="detail-section">
            <h3>Description</h3>
            <p class="description-text">{{ desc }}</p>
          </div>
        }

        @if (vm.data.version_groups.length > 0) {
          <div class="detail-section">
            <h3>Version Groups ({{ vm.data.version_groups.length }})</h3>
            <ul class="link-list">
              @for (vg of vm.data.version_groups; track vg.name) {
                <li><span>{{ vg.name | pokeName }}</span></li>
              }
            </ul>
          </div>
        } @else {
          <div class="empty-state">No version groups available.</div>
        }
      }
    }
  `,
  styles: [`
    @use 'variables' as *;

    .description-text {
      font-size: $font-size-base;
      color: $color-text-secondary;
      line-height: 1.6;
    }
  `],
})
export class LearnMethodDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PokeApiService);

  vm$ = this.route.paramMap.pipe(
    switchMap(params =>
      this.api.getResource<MoveLearnMethod>('move-learn-method', params.get('name')!).pipe(
        map(data => ({ data, loading: false })),
        catchError(() => of({ data: null as MoveLearnMethod | null, loading: false })),
      ),
    ),
    startWith({ data: null as MoveLearnMethod | null, loading: true }),
  );

  getDescription(lm: MoveLearnMethod): string | null {
    const entry = lm.descriptions.find(d => d.language.name === 'en');
    return entry?.description ?? null;
  }
}
