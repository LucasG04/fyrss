import { httpResource } from '@angular/common/http';
import { computed, Service } from '@angular/core';
import { Config } from '../../shared/types/config';

@Service()
export class ConfigService {
  private readonly resource = httpResource<Config>(() => '/config.json');

  readonly loaded = computed(() => this.resource.hasValue());

  get config(): Config {
    if (!this.resource.hasValue()) {
      throw new Error('Config not loaded');
    }
    return this.resource.value();
  }
}
