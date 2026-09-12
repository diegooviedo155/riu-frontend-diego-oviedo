import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="navbar-header">
      <div class="navbar-top-bar"></div>
      <div class="navbar-container">
        <a routerLink="/heroes" class="brand">
          <mat-icon class="brand-icon" aria-hidden="true">shield</mat-icon>
          <span class="brand-title">Heroes</span>
        </a>
      </div>
    </header>
  `,
  styles: [
    `
      .navbar-header {
        background: #ffffff;
        border-bottom: 1px solid #e8e5e0;
        position: sticky;
        top: 0;
        z-index: 100;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
      }
      .navbar-top-bar {
        height: 3px;
        background: #c4002e;
        width: 100%;
      }
      .navbar-container {
        max-width: 1200px;
        margin: 0 auto;
        height: 58px;
        display: flex;
        align-items: center;
        padding: 0 24px;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: #c4002e;
      }
      .brand-icon {
        width: 26px;
        height: 26px;
        font-size: 26px;
        color: #c4002e;
      }
      .brand-title {
        color: #1c1c1c;
        font-size: 1.2rem;
        font-weight: 700;
        letter-spacing: -0.01em;
      }
    `,
  ],
})
export class NavbarComponent {}
