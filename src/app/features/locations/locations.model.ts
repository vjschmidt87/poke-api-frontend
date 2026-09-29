import {
  Name,
  NamedAPIResource,
  GenerationGameIndex,
  VersionEncounterDetail,
} from '../../core/models/common.model';

// Location
export interface Location {
  id: number;
  name: string;
  region: NamedAPIResource | null;
  names: Name[];
  game_indices: GenerationGameIndex[];
  areas: NamedAPIResource[];
}

// Location Area
export interface EncounterMethodRate {
  encounter_method: NamedAPIResource;
  version_details: EncounterMethodRateVersionDetail[];
}

export interface EncounterMethodRateVersionDetail {
  rate: number;
  version: NamedAPIResource;
}

export interface PokemonEncounter {
  pokemon: NamedAPIResource;
  version_details: VersionEncounterDetail[];
}

export interface LocationArea {
  id: number;
  name: string;
  game_index: number;
  encounter_method_rates: EncounterMethodRate[];
  location: NamedAPIResource;
  names: Name[];
  pokemon_encounters: PokemonEncounter[];
}

// Pal Park Area
export interface PalParkEncounterSpecies {
  base_score: number;
  rate: number;
  pokemon_species: NamedAPIResource;
}

export interface PalParkArea {
  id: number;
  name: string;
  names: Name[];
  pokemon_encounters: PalParkEncounterSpecies[];
}

// Region
export interface Region {
  id: number;
  name: string;
  locations: NamedAPIResource[];
  main_generation: NamedAPIResource;
  names: Name[];
  pokedexes: NamedAPIResource[];
  version_groups: NamedAPIResource[];
}
