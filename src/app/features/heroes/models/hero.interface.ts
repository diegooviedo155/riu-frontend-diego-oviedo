import { PublisherType } from './hero.types';

export interface Hero {
  readonly id: string;
  readonly name: string;
  readonly alias: string;
  readonly power: string;
  readonly publisher?: PublisherType;
  readonly description?: string;
}
