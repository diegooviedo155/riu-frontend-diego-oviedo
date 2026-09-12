import '@angular/compiler';
import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

import { ɵgetComponentDef } from '@angular/core';
import { HeroCardComponent } from './app/features/heroes/components/hero-card/hero-card.component';
import { HeroSearchComponent } from './app/features/heroes/components/hero-search/hero-search.component';
import { HeroPaginatorComponent } from './app/features/heroes/components/hero-paginator/hero-paginator.component';

function patchSignalMetadata(
  component: any,
  inputs: Record<string, string>,
  outputs?: Record<string, string>,
): void {
  const def = ɵgetComponentDef(component) as any;
  if (def) {
    const updatedInputs: Record<string, any> = { ...(def.inputs || {}) };
    for (const [key, prop] of Object.entries(inputs)) {
      updatedInputs[key] = [prop, 1, null];
    }
    def.inputs = updatedInputs;

    if (outputs) {
      const updatedOutputs: Record<string, string> = { ...(def.outputs || {}) };
      for (const [key, prop] of Object.entries(outputs)) {
        updatedOutputs[key] = prop;
      }
      def.outputs = updatedOutputs;
    }
  }
}

patchSignalMetadata(
  HeroCardComponent,
  { hero: 'hero' },
  { edit: 'edit', delete: 'delete' },
);

patchSignalMetadata(
  HeroSearchComponent,
  { searchTerm: 'searchTerm' },
  { searchChange: 'searchChange', clear: 'clear' },
);

patchSignalMetadata(
  HeroPaginatorComponent,
  {
    length: 'length',
    pageSize: 'pageSize',
    pageIndex: 'pageIndex',
    pageSizeOptions: 'pageSizeOptions',
  },
  { pageChange: 'pageChange' },
);
