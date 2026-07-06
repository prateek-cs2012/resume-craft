import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

// Module-level flag so the AdSense <script> is only injected once per page load.
let adsenseScriptLoaded = false;

function loadAdsenseScript(publisherId: string): void {
  if (adsenseScriptLoaded || !publisherId || typeof document === 'undefined') return;
  adsenseScriptLoaded = true;
  const s = document.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
  document.head.appendChild(s);
}

@Component({
  selector: 'app-ad-unit',
  standalone: true,
  imports: [CommonModule],
  template: `
<div *ngIf="show && publisherId" class="ad-container">
  <div class="ad-label">Advertisement</div>
  <ins class="adsbygoogle"
    style="display:block"
    [attr.data-ad-client]="publisherId"
    [attr.data-ad-slot]="adSlot"
    [attr.data-ad-format]="format"
    data-full-width-responsive="true">
  </ins>
</div>
  `,
  styles: [`
    .ad-container {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 8px;
      background: #fafafa;
      text-align: center;
      margin: 12px 0;
    }
    .ad-label {
      font-size: 9px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    ins.adsbygoogle { min-height: 90px; }
  `]
})
export class AdUnitComponent implements OnInit {
  /** Ad slot ID from your AdSense account */
  @Input() adSlot = '';
  /** AdSense ad format */
  @Input() format: 'auto' | 'rectangle' | 'horizontal' = 'auto';

  publisherId = '';

  private userService = inject(UserService);

  get show(): boolean {
    return this.userService.isFree;
  }

  async ngOnInit(): Promise<void> {
    if (!this.show) return;

    try {
      const res = await fetch('/api/config');
      const config = (await res.json()) as { adsensePublisherId?: string };
      const raw = config.adsensePublisherId ?? '';
      // Normalize: accept both "ca-pub-XXXX" and bare numeric "XXXX"
      this.publisherId = raw.startsWith('ca-pub-') ? raw : raw ? `ca-pub-${raw}` : '';
    } catch {
      // Config unavailable — ad simply won't render
      return;
    }

    if (!this.publisherId) return;

    loadAdsenseScript(this.publisherId);

    // Push the ad unit after a tick so the <ins> element is in the DOM
    setTimeout(() => {
      try {
        const w = window as unknown as Record<string, unknown[]>;
        if (!Array.isArray(w['adsbygoogle'])) w['adsbygoogle'] = [];
        w['adsbygoogle'].push({});
      } catch {
        // AdSense not ready yet — harmless
      }
    }, 100);
  }
}
