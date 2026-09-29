import { Effect, FlavorText, Name, NamedAPIResource } from '../../core/models/common.model';

// Contest Type
export interface ContestName {
  name: string;
  color: string;
  language: NamedAPIResource;
}

export interface ContestType {
  id: number;
  name: string;
  berry_flavor: NamedAPIResource;
  names: ContestName[];
}

// Contest Effect (unnamed resource)
export interface ContestEffect {
  id: number;
  appeal: number;
  jam: number;
  effect_entries: Effect[];
  flavor_text_entries: FlavorText[];
}

// Super Contest Effect (unnamed resource)
export interface SuperContestEffect {
  id: number;
  appeal: number;
  flavor_text_entries: FlavorText[];
  moves: NamedAPIResource[];
}
