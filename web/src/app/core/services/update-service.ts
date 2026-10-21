import { DOCUMENT } from '@angular/common';
import { inject, Service } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { filter } from 'rxjs';

/** Applies service worker updates on the next navigation, so reading is never interrupted. */
@Service()
export class UpdateService {
  private readonly updates = inject(SwUpdate);
  private readonly document = inject(DOCUMENT);
  private updateReady = false;

  constructor() {
    if (!this.updates.isEnabled) return;

    this.updates.versionUpdates
      .pipe(filter((e) => e.type === 'VERSION_READY'))
      .subscribe(() => (this.updateReady = true));

    inject(Router)
      .events.pipe(filter((e) => e instanceof NavigationStart))
      .subscribe((e) => {
        if (this.updateReady) this.document.location.href = e.url;
      });

    this.updates.unrecoverable.subscribe(() => this.document.location.reload());

    // An installed PWA can stay open for days; check whenever it is brought back.
    this.document.addEventListener('visibilitychange', () => {
      if (this.document.visibilityState === 'visible') {
        this.updates.checkForUpdate().catch(() => {
          /* offline */
        });
      }
    });
  }
}
