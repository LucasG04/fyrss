import { effect, signal, computed, Service } from '@angular/core';
import { ThemeMode } from '../../shared/types/theme-mode';

const STORAGE_KEY = 'app:theme-mode';

@Service()
export class ThemeService {
  /** Media query for OS-level dark scheme */
  private readonly mql: MediaQueryList | null =
    'matchMedia' in window
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

  /** The selected mode (persisted) */
  readonly mode = signal<ThemeMode>(this.readStoredMode());

  /** Current OS preference (live) */
  readonly osPrefersDark = signal<boolean>(this.mql?.matches ?? false);

  /** Effective dark flag derived from mode + OS */
  readonly effectiveDark = computed<boolean>(() => {
    const m = this.mode();
    if (m === 'dark') return true;
    if (m === 'light') return false;
    return this.osPrefersDark();
  });

  constructor() {
    // React to OS theme changes when in 'system' mode
    if (this.mql) {
      const onChange = (e: MediaQueryListEvent) =>
        this.osPrefersDark.set(e.matches);
      this.mql.addEventListener('change', onChange);
      // no removal needed; service lives for app lifetime
    }

    // Apply/remove .dark on <html> when the effective theme changes
    effect(() => {
      const dark = this.effectiveDark();
      document.documentElement.classList.toggle('dark', dark);
      document
        .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
        .forEach((m) => (m.content = dark ? '#0f172a' : '#ffffff'));
    });

    // Persist only the selected mode
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, this.mode());
      } catch (e) {
        /* ignore storage errors */
        console.error('Failed to store theme mode', e);
      }
    });
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  private readStoredMode(): ThemeMode {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
    } catch {
      return 'system';
    }
  }
}
