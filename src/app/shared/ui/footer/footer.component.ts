import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="app-footer">
      <div class="app-footer__container">
        <div class="app-footer__brand">
          <span class="app-footer__riu">RIU</span>
          <span class="app-footer__brand-text">Hotels & Resorts</span>
        </div>
        <p class="app-footer__text">
          Prueba Técnica Frontend · Desarrollado por
          <strong>Diego Oviedo</strong>
        </p>
      </div>
    </footer>
  `,
  styles: [
    `
      .app-footer {
        background: #1c1c1c;
        color: #ffffff;
        border-top: 1px solid #2e2e2e;
        padding: 24px 0;
      }
      .app-footer__container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
      }
      .app-footer__brand {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .app-footer__riu {
        background: #c4002e;
        color: #ffffff;
        font-weight: 800;
        font-size: 0.8rem;
        padding: 2px 6px;
        border-radius: 4px;
      }
      .app-footer__brand-text {
        font-size: 0.9rem;
        font-weight: 600;
        color: #e0e0e0;
      }
      .app-footer__text {
        font-size: 0.85rem;
        color: #999999;
        margin: 0;
      }
    `,
  ],
})
export class FooterComponent {}
