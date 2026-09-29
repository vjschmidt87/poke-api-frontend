import {
  Name,
  NamedAPIResource,
  Description,
} from '../../core/models/common.model';

// Generation
export interface Generation {
  id: number;
  name: string;
  abilities: NamedAPIResource[];
  main_region: NamedAPIResource;
  moves: NamedAPIResource[];
  names: Name[];
  pokemon_species: NamedAPIResource[];
  types: NamedAPIResource[];
  version_groups: NamedAPIResource[];
}

// Pokedex
export interface PokemonEntry {
  entry_number: number;
  pokemon_species: NamedAPIResource;
}

export interface Pokedex {
  id: number;
  name: string;
  is_main_series: boolean;
  descriptions: Description[];
  names: Name[];
  pokemon_entries: PokemonEntry[];
  region: NamedAPIResource | null;
  version_groups: NamedAPIResource[];
}

// Version
export interface Version {
  id: number;
  name: string;
  names: Name[];
  version_group: NamedAPIResource;
}

// Version Group
export interface VersionGroup {
  id: number;
  name: string;
  order: number;
  generation: NamedAPIResource;
  move_learn_methods: NamedAPIResource[];
  pokedexes: NamedAPIResource[];
  regions: NamedAPIResource[];
  versions: NamedAPIResource[];
}
