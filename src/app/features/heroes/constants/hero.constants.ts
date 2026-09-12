export const HERO_PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 6,
  PAGE_SIZE_OPTIONS: [6, 12, 24],
} as const;

export const SEARCH_DEBOUNCE_TIME_MS = 250;

export const HERO_ROUTES = {
  HEROES: '/heroes',
  NEW: '/heroes/new',
  EDIT: '/heroes/edit',
} as const;
