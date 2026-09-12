import { Hero } from './hero.interface';

export type HeroCreateDto = Omit<Hero, 'id'>;
export type HeroUpdateDto = Partial<HeroCreateDto>;
