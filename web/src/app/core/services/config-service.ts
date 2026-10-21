import { httpResource } from '@angular/common/http';
import { computed, inject, PLATFORM_ID, Service } from '@angular/core';
import { Config } from '../../shared/types/config';
import { isPlatformBrowser } from '@angular/common';

@Service()
export class ConfigService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly resource = httpResource<Config>(() =>
    this.isBrowser ? '/config' : undefined,
  );

  readonly loaded = computed(() => this.resource.hasValue());

  get config(): Config {
    if (!this.resource.hasValue()) {
      throw new Error('Config not loaded');
    }
    return this.resource.value();
  }
}
