import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="loading-container">
      <div class="pokeball-spinner">
        <div class="pokeball">
          <div class="pokeball-top"></div>
          <div class="pokeball-center"></div>
          <div class="pokeball-bottom"></div>
        </div>
      </div>
      <p>Loading...</p>
    </div>
  `,
  styles: [`
    @use 'variables' as *;

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      gap: 1rem;

      p { color: $color-text-muted; font-size: $font-size-base; }
    }

    .pokeball-spinner { animation: spin 1s linear infinite; }

    .pokeball {
      width: 40px; height: 40px;
      border-radius: 50%;
      border: 3px solid $color-spinner-border;
      position: relative;
      overflow: hidden;
    }

    .pokeball-top {
      width: 100%; height: 50%;
      background: $color-primary;
    }

    .pokeball-bottom {
      width: 100%; height: 50%;
      background: $color-surface;
    }

    .pokeball-center {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 12px; height: 12px;
      background: $color-surface;
      border-radius: 50%;
      border: 3px solid $color-spinner-border;
      z-index: 1;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `],
})
export class LoadingComponent {}
