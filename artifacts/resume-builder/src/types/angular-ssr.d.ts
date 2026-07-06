declare module '@angular/ssr' {
  import { EnvironmentProviders } from '@angular/core';
  export function provideServerRendering(): EnvironmentProviders;
}
